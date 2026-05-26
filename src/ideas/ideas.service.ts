import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdeaEntity } from './infrastructure/persistence/relational/entities/idea.entity';
import { IdeaEditEntity } from './idea-edits/infrastructure/persistence/relational/entities/idea-edit.entity';
import { Idea } from './domain/idea';
import { IdeaEdit } from './idea-edits/domain/idea-edit';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';
import { IdeaStatus } from './idea-status.enum';

@Injectable()
export class IdeasService {
  constructor(
    @InjectRepository(IdeaEntity)
    private readonly ideaRepo: Repository<IdeaEntity>,
    @InjectRepository(IdeaEditEntity)
    private readonly editRepo: Repository<IdeaEditEntity>,
  ) {}

  async create(
    tenantId: string,
    authorUserId: string,
    dto: CreateIdeaDto,
  ): Promise<Idea> {
    const entity = this.ideaRepo.create({
      tenantId,
      authorUserId,
      ticker: dto.ticker ?? null,
      thesis: dto.thesis,
      timeframe: dto.timeframe,
      invalidation: dto.invalidation,
      status: IdeaStatus.active,
      resolvedAt: null,
    });
    const saved = await this.ideaRepo.save(entity);
    return this.toIdea(saved);
  }

  async findAll(tenantId: string): Promise<Idea[]> {
    const entities = await this.ideaRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.toIdea(e));
  }

  async findByIdOrFail(tenantId: string, id: string): Promise<Idea> {
    const entity = await this.ideaRepo.findOne({ where: { tenantId, id } });
    if (!entity) throw new NotFoundException('Idea not found');
    return this.toIdea(entity);
  }

  async update(
    tenantId: string,
    id: string,
    editorUserId: string,
    dto: UpdateIdeaDto,
  ): Promise<Idea> {
    const entity = await this.ideaRepo.findOne({ where: { tenantId, id } });
    if (!entity) throw new NotFoundException('Idea not found');

    const editableFields = [
      'ticker',
      'thesis',
      'timeframe',
      'invalidation',
    ] as const;

    const edits: IdeaEditEntity[] = [];
    for (const field of editableFields) {
      const newVal = dto[field];
      if (newVal !== undefined && String(newVal) !== String(entity[field])) {
        edits.push(
          this.editRepo.create({
            tenantId,
            ideaId: id,
            editorUserId,
            field,
            oldValue: String(entity[field] ?? ''),
            newValue: String(newVal),
          }),
        );
        (entity as unknown as Record<string, unknown>)[field] = newVal;
      }
    }

    const saved = await this.ideaRepo.save(entity);
    if (edits.length) await this.editRepo.save(edits);
    return this.toIdea(saved);
  }

  async resolve(tenantId: string, id: string): Promise<Idea> {
    const entity = await this.ideaRepo.findOne({ where: { tenantId, id } });
    if (!entity) throw new NotFoundException('Idea not found');
    entity.status = IdeaStatus.resolved;
    entity.resolvedAt = new Date();
    const saved = await this.ideaRepo.save(entity);
    return this.toIdea(saved);
  }

  async getEdits(tenantId: string, ideaId: string): Promise<IdeaEdit[]> {
    const entities = await this.editRepo.find({
      where: { tenantId, ideaId },
      order: { editedAt: 'DESC' },
    });
    return entities.map((e) => this.toEdit(e));
  }

  private toIdea(e: IdeaEntity): Idea {
    const d = new Idea();
    d.id = e.id;
    d.tenantId = e.tenantId;
    d.authorUserId = e.authorUserId;
    d.ticker = e.ticker;
    d.thesis = e.thesis;
    d.timeframe = e.timeframe;
    d.invalidation = e.invalidation;
    d.status = e.status;
    d.createdAt = e.createdAt;
    d.resolvedAt = e.resolvedAt;
    return d;
  }

  private toEdit(e: IdeaEditEntity): IdeaEdit {
    const d = new IdeaEdit();
    d.id = e.id;
    d.tenantId = e.tenantId;
    d.ideaId = e.ideaId;
    d.editorUserId = e.editorUserId;
    d.field = e.field;
    d.oldValue = e.oldValue;
    d.newValue = e.newValue;
    d.editedAt = e.editedAt;
    return d;
  }
}
