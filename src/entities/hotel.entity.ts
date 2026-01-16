import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Yatra } from './yatra.entity';
import { Room } from './room.entity';

@Entity('hotels')
@Index('idx_hotels_name', ['name'])
@Index('idx_hotels_active', ['is_active'])
@Index('idx_hotels_yatra', ['yatra_id'])
export class Hotel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name!: string;

  @Column({ type: 'text' })
  address!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  map_link!: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'distance_from_bhavan' })
  distance_from_bhavan!: string | null;

  @Column({ type: 'uuid', name: 'yatra_id' })
  yatra_id!: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  hotel_type: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  manager_name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  manager_contact: string;

  @Column({ type: 'int', nullable: true })
  number_of_days: number;

  @Column({ type: 'datetime', nullable: true })
  start_date: Date;

  @Column({ type: 'datetime', nullable: true })
  end_date: Date;

  @Column({ type: 'varchar', length: 10, nullable: true })
  check_in_time: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  check_out_time: string;

  @Column({ type: 'boolean', default: false })
  has_elevator: boolean;

  @Column({ type: 'int' })
  total_floors: number;

  @Column({ type: 'json', default: () => "'[]'" })
  floors: any[];

  @Column({ type: 'int', default: 0 })
  total_rooms: number;

  @Column({ type: 'int', default: 0 })
  occupied_rooms: number;

  @Column({ type: 'int', default: 0 })
  available_rooms: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Yatra, (yatra) => yatra.hotels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'yatra_id' })
  yatra: Yatra;

  @OneToMany(() => Room, (room) => room.hotel, { cascade: true })
  rooms: Room[];
}
