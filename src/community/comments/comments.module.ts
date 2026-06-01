import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './infrastructure/persistence/relational/entities/comment.entity';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { MembershipsModule } from '../../tenant/memberships/memberships.module';
import { IdeaEntity } from '../../ideas/infrastructure/persistence/relational/entities/idea.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentEntity, IdeaEntity]),
    MembershipsModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
