import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Hotel } from './hotel.entity';
import { YatraRegistration } from './yatra-registration.entity';

@Entity('yatra')
@Index('idx_yatra_name', ['name'])
@Index('idx_yatra_active', ['start_date'])
@Index('idx_yatra_end_date', ['end_date'])
export class Yatra {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  banner_image: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  mobile_banner_image: string;

  @Column({ type: 'datetime' })
  start_date: Date;

  @Column({ type: 'datetime' })
  end_date: Date;

  @Column({ type: 'datetime' })
  registration_start_date: Date;

  @Column({ type: 'datetime' })
  registration_end_date: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
    precision: 0,
  })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
    precision: 0,
  })
  updated_at: Date;

  @OneToMany(() => Hotel, (hotel) => hotel.yatra)
  hotels: Hotel[];

  @OneToMany(() => YatraRegistration, (registration) => registration.yatra)
  registrations: YatraRegistration[];
}
