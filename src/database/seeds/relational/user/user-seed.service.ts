import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { UserPlatformRole } from '../../../../users/user-platform-role.enum';

@Injectable()
export class UserSeedService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async run() {
    const users = [
      {
        email: 'admin@investio.com',
        password: 'admin123',
        role: UserPlatformRole.ADMIN,
      },
      {
        email: 'test@investio.com',
        password: 'test123',
        role: UserPlatformRole.USER,
      },
    ];

    for (const { email, password, role } of users) {
      const exists = await this.repository.count({
        where: { email },
      });

      if (!exists) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        await this.repository.save(
          this.repository.create({
            email,
            password: hashedPassword,
            role,
          }),
        );
      }
    }
  }
}
