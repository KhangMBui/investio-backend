import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, Repository } from 'typeorm';
import { CommentEntity } from './infrastructure/persistence/relational/entities/comment.entity';
import { Comment } from './domain/comment';
import { CreateCommentDto } from './dto/create-comment.dto';
import { SortCommentDto } from './dto/query-comment.dto';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { IdeaEntity } from '../../ideas/infrastructure/persistence/relational/entities/idea.entity';
import { MembershipRole } from '../../tenant/memberships/membership-role.enum';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly repo: Repository<CommentEntity>,

    @InjectRepository(IdeaEntity)
    private readonly ideaRepo: Repository<IdeaEntity>,
  ) {}

  async create(
    tenantId: string,
    ideaId: string,
    authorUserId: string,
    dto: CreateCommentDto,
  ): Promise<Comment> {
    const entity = this.repo.create({
      tenantId,
      ideaId,
      authorUserId,
      body: dto.body,
    });
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async findManyWithPagination({
    tenantId,
    ideaId,
    sortOptions,
    paginationOptions,
  }: {
    tenantId: string;
    ideaId: string;
    sortOptions?: SortCommentDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Comment[]> {
    const order = sortOptions?.reduce<FindOptionsOrder<CommentEntity>>(
      (acc, sort) => ({
        ...acc,
        [sort.orderBy ?? 'createdAt']: sort.order ?? 'ASC',
      }),
      {},
    ) ?? { createdAt: 'ASC' };

    const entities = await this.repo.find({
      where: { tenantId, ideaId },
      order,
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((e) => this.toDomain(e));
  }

  async findByIdea(tenantId: string, ideaId: string): Promise<Comment[]> {
    const entities = await this.repo.find({
      where: { tenantId, ideaId },
      order: { createdAt: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  private toDomain(e: CommentEntity): Comment {
    const d = new Comment();
    d.id = e.id;
    d.tenantId = e.tenantId;
    d.ideaId = e.ideaId;
    d.authorUserId = e.authorUserId;
    d.body = e.body;
    d.createdAt = e.createdAt;
    return d;
  }

  async remove(
    tenantId: string,
    ideaId: string,
    commentId: string,
    callerId: string,
    callerRole: MembershipRole,
  ): Promise<void> {
    const [comment, idea] = await Promise.all([
      this.repo.findOne({ where: { tenantId, ideaId, id: commentId } }),
      this.ideaRepo.findOne({ where: { tenantId, id: ideaId } }),
    ]);

    if (!comment || !idea) throw new NotFoundException('Comment not found');

    const canDelete =
      comment.authorUserId === callerId ||
      idea.authorUserId === callerId ||
      callerRole === MembershipRole.mod ||
      callerRole === MembershipRole.owner;

    if (!canDelete) throw new ForbiddenException();

    await this.repo.remove(comment);
  }
}
