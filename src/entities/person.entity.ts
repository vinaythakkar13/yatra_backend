import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { YatraRegistration } from './yatra-registration.entity';
import { Gender } from '../enums/gender.enum';

@Entity('persons')
@Index('idx_person_registration', ['registration_id'])
export class Person {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'registration_id' })
  registration_id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column({ type: 'boolean', default: false, name: 'is_handicapped' })
  is_handicapped: boolean;

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

  @ManyToOne(() => YatraRegistration, (registration) => registration.persons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'registration_id' })
  registration: YatraRegistration;
}
