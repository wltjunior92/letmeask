import { ButtonHTMLAttributes } from "react";
import { FiChevronRight } from "react-icons/fi";

import '../styles/roomCard.scss';

type RoomCardProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  title: string;
}

export function RoomCard({ title, ...rest }: RoomCardProps) {
  return (
    <button type="button" className="container" {...rest}>
      <span>{title}</span>
      <div>
        <FiChevronRight />
      </div>
    </button>
  );
}