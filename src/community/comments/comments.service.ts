import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from './infrastructure/persistence/relational/entities/comment.entity';
import { Comment } from './domain/comment';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly repo: Repository<CommentEntity>,
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
}
