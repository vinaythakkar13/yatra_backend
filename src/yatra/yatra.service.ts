import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Yatra } from '../entities/yatra.entity';
import { CreateYatraDto } from './dto/create-yatra.dto';
import { UpdateYatraDto } from './dto/update-yatra.dto';

@Injectable()
export class YatraService {
  constructor(
    @InjectRepository(Yatra)
    private yatraRepository: Repository<Yatra>,
  ) { }

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
      mobile_banner_image: createYatraDto.mobile_banner_image,
      start_date: new Date(createYatraDto.start_date),
      end_date: new Date(createYatraDto.end_date),
      registration_start_date: new Date(createYatraDto.registration_start_date),
      registration_end_date: new Date(createYatraDto.registration_end_date),
      description: createYatraDto.description,
    });

    return await this.yatraRepository.save(yatra);
  }

  async update(id: string, updateYatraDto: UpdateYatraDto) {
    const yatra = await this.yatraRepository.findOne({ where: { id } });
    if (!yatra) {
      throw new NotFoundException('Yatra not found');
    }

    // Only update fields that are provided
    if (updateYatraDto.name !== undefined) {
      yatra.name = updateYatraDto.name;
    }
    if (updateYatraDto.banner_image !== undefined) {
      yatra.banner_image = updateYatraDto.banner_image;
    }
    if (updateYatraDto.mobile_banner_image !== undefined) {
      yatra.mobile_banner_image = updateYatraDto.mobile_banner_image;
    }
    if (updateYatraDto.start_date !== undefined) {
      yatra.start_date = new Date(updateYatraDto.start_date);
    }
    if (updateYatraDto.end_date !== undefined) {
      yatra.end_date = new Date(updateYatraDto.end_date);
    }
    if (updateYatraDto.registration_start_date !== undefined) {
      yatra.registration_start_date = new Date(updateYatraDto.registration_start_date);
    }
    if (updateYatraDto.registration_end_date !== undefined) {
      yatra.registration_end_date = new Date(updateYatraDto.registration_end_date);
    }
    if (updateYatraDto.description !== undefined) {
      yatra.description = updateYatraDto.description;
    }

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

    // Return all future yatras (haven't ended yet)
    // This includes yatras with any registration status
    const activeYatras = await this.yatraRepository.find({
      where: {
        end_date: MoreThanOrEqual(today),
      },
      order: { start_date: 'ASC' },
    });

    return activeYatras;
  }
}
