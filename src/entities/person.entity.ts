import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { YatraRegistration } from './yatra-registration.entity';
import { Gender } from './user.entity';

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

  @Column({ 
    type: 'datetime', 
    name: 'created_at', 
    default: () => 'CURRENT_TIMESTAMP',
    insert: false,
    update: false
  })
  created_at: Date;

  @Column({ 
    type: 'datetime', 
    name: 'updated_at', 
    default: () => 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    insert: false
  })
  updated_at: Date;

  @ManyToOne(() => YatraRegistration, (registration) => registration.persons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'registration_id' })
  registration: YatraRegistration;
}
