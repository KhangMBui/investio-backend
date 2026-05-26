import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './infrastructure/persistence/relational/entities/comment.entity';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { MembershipsModule } from '../../tenant/memberships/memberships.module';

@Module({
  imports: [TypeOrmModule.forFeature([CommentEntity]), MembershipsModule],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
