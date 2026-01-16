import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Yatra } from '../entities/yatra.entity';
import { CreateYatraDto } from './dto/create-yatra.dto';

@Injectable()
export class YatraService {
  constructor(
    @InjectRepository(Yatra)
    private yatraRepository: Repository<Yatra>,
  ) {}

  async findAll() {
    return await this.yatraRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    const yatra = await this.yatraRepository.findOne({ where: { id } });
    if (!yatra) {
      throw new NotFoundException('Yatra not found');
    }
    return yatra;
  }

  async create(createYatraDto: CreateYatraDto) {
    const yatra = this.yatraRepository.create({
      name: createYatraDto.name,
      banner_image: createYatraDto.banner_image,
      start_date: new Date(createYatraDto.start_date),
      end_date: new Date(createYatraDto.end_date),
      registration_start_date: new Date(createYatraDto.registration_start_date),
      registration_end_date: new Date(createYatraDto.registration_end_date),
      description: createYatraDto.description,
    });

    return await this.yatraRepository.save(yatra);
  }

  async remove(id: string) {
    const yatra = await this.yatraRepository.findOne({ where: { id } });
    if (!yatra) {
      throw new NotFoundException('Yatra not found');
    }
    await this.yatraRepository.remove(yatra);
    return { message: 'Yatra deleted successfully' };
  }

  async getActiveYatras() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Active yatras: registration is open AND yatra hasn't ended yet
    const activeYatras = await this.yatraRepository.find({
      where: {
        end_date: MoreThanOrEqual(today),
        registration_start_date: LessThanOrEqual(today),
        registration_end_date: MoreThanOrEqual(today),
      },
      order: { start_date: 'ASC' },
    });

    // Fallback: If no yatras with open registration, return all future yatras
    if (activeYatras.length === 0) {
      const futureYatras = await this.yatraRepository.find({
        where: {
          end_date: MoreThanOrEqual(today),
        },
        order: { start_date: 'ASC' },
      });
      return futureYatras;
    }

    return activeYatras;
  }
}
