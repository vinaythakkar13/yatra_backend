import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Hotel } from './hotel.entity';
import { User } from './user.entity';

export enum ToiletType {
  WESTERN = 'western',
  INDIAN = 'indian',
}

@Entity('rooms')
@Index('idx_rooms_hotel', ['hotel_id'])
@Index('idx_rooms_floor', ['floor'])
@Index('idx_rooms_occupied', ['is_occupied'])
@Index('idx_rooms_assigned_user', ['assigned_to_user_id'])
@Index('idx_rooms_room_number', ['room_number'])
@Unique('unique_hotel_room', ['hotel_id', 'room_number'])
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  room_number: string;

  @Column({ type: 'varchar', length: 10 })
  floor: string;

  @Column({ type: 'uuid', name: 'hotel_id' })
  hotel_id: string;

  @Column({
    type: 'enum',
    enum: ToiletType,
    default: ToiletType.WESTERN,
    nullable: true,
  })
  toilet_type: ToiletType;

  @Column({ type: 'int', nullable: true })
  number_of_beds: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, nullable: true })
  charge_per_day: number;

  @Column({ type: 'boolean', default: false })
  is_occupied: boolean;

  @Column({ type: 'uuid', name: 'assigned_to_user_id', nullable: true })
  assigned_to_user_id: string;

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

  @ManyToOne(() => Hotel, (hotel) => hotel.rooms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hotel_id' })
  hotel: Hotel;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_to_user_id' })
  assignedUser: User;
}
