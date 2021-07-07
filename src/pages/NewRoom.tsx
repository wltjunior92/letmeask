import { FormEvent, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

import { database } from '../services/firebase';

import { Button } from '../components/Button';

import illustrationImg from '../assets/images/illustration.svg';
import logoImg from '../assets/images/logo.svg';

import '../styles/auth.scss'
import { RoomCard } from '../components/RoomsCard';

type FirebaseRooms = Record<string, {
  id: string;
  authorId: string;
  endedAt: string | undefined;
  title: string;
}>

type Room = {
  id: string;
  authorId: string;
  endedAt: string | undefined;
  title: string;
}

export function NewRoom() {
  const { user } = useAuth();
  const history = useHistory();

  const [newRoom, setNewRoom] = useState('');
  const [userCreatedRooms, setUserCreatedRooms] = useState<Room[]>([]);

  useEffect(() => {
    const roomRef = database.ref('rooms');

    roomRef.once('value', room => {
      const databaseRoom = room.val();

      const firebaseRoom: FirebaseRooms = databaseRoom ?? {};

      const parsedRooms = Object.entries(firebaseRoom).map(([key, value]) => {
        return {
          id: key,
          authorId: value.authorId,
          endedAt: value.endedAt,
          title: value.title,
        }
      }).filter(room => room.authorId === user?.id)
        .filter(room => !room.endedAt);

      setUserCreatedRooms(parsedRooms);
    })

    return () => {
      roomRef.off('value');
    }
  }, [user?.id]);

  function handleNavigateToExistingRoom(roomId: string) {
    history.push(`/admin/rooms/${roomId}`);
  }

  async function handleCreateRoom(event: FormEvent) {
    event.preventDefault();

    if (newRoom.trim() === '') {
      return;
    }

    const roomRef = database.ref('rooms');

    const firebaseRoom = await roomRef.push({
      title: newRoom,
      authorId: user?.id,
    })

    history.push(`/admin/rooms/${firebaseRoom.key}`)
  }

  return (
    <div id="page-auth">
      <aside>
        <img src={illustrationImg} alt="Illustração simbolizando perguntas e respostas" />
        <main>
          <strong>Crie salas de Q&amp;A ao-vivo</strong>
          <p>Tire as dúvidas da sua audiência em tempo real</p>
        </main>
      </aside>
      <main>
        <div className="main-content">
          <img src={logoImg} alt="Letmeask" />
          <h2>Criar uma nova sala</h2>
          <form onSubmit={handleCreateRoom}>
            <input
              type="text"
              placeholder="Nome da sala"
              onChange={event => setNewRoom(event.target.value)}
              value={newRoom}
            />
            <Button type="submit">
              Criar sala
            </Button>

          </form>
          <p>
            Quer entrar em uma sala existente? <Link to="/">clique aqui</Link>
          </p>
          {userCreatedRooms.length !== 0 &&
            <>
              <h3>Acesse uma sala que você já criou</h3>
              <div className="user-created-rooms">
                {userCreatedRooms.map(room => (
                  <RoomCard
                    key={room.id}
                    title={room.title}
                    onClick={() => handleNavigateToExistingRoom(room.id)}
                  />
                ))}
              </div>
            </>
          }
        </div>
      </main>
    </div>
  )
}