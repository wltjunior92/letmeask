import copyImg from "../assets/images/copy.svg";

import '../styles/room-code.scss';

type RoomCodeProps = {
  code: string
  isAdmin?: boolean;
}

export function RoomCode({ code, isAdmin = false }: RoomCodeProps) {
  function copyRoomCodeToClipboard() {
    navigator.clipboard.writeText(code)
  }

  return (
    <button
      className={`room-code
        ${isAdmin ? 'room-code-admin' : ''}`}
      onClick={copyRoomCodeToClipboard}
    >
      <div>
        <img src={copyImg} alt="Copy room code" />
      </div>
      <span>{code}</span>
    </button>
  );
}