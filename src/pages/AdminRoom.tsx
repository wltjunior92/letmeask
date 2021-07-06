import { useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";

import { useRoom } from "../hooks/useRoom";

import { database } from "../services/firebase";

import { Button } from '../components/Button';
import { RoomCode } from '../components/RoomCode';
import { Question } from "../components/Question";

import logoImg from '../assets/images/logo.svg';
import deleteImg from '../assets/images/delete.svg';
import checkImg from '../assets/images/check.svg';
import answerImg from '../assets/images/answer.svg';
import emptyQuestionsImg from '../assets/images/empty-questions.svg';

import '../styles/room.scss';
import { useAuth } from "../hooks/useAuth";

type RoomParams = {
  id: string;
}

export function AdminRoom() {
  const { user } = useAuth();
  const history = useHistory();

  const params = useParams<RoomParams>();
  const roomId = params.id;

  const { title, questions } = useRoom(roomId);

  useEffect(() => {
    database.ref(`rooms/${roomId}`).once('value')
      .then(result => result.val())
      .then(room => {
        if (room.authorId !== user?.id) {
          history.push(`/rooms/${roomId}`)
        }
      })
  }, [roomId, user, history]);

  async function handleDeleteQuestion(questionId: string) {
    if (window.confirm('Tem certeza que deseja excluir essa pergunta?')) {
      await database.ref(`rooms/${roomId}/questions/${questionId}`).remove();
    }
  }

  async function handleCheckQuestionAsAnswered(questionId: string) {
    const { isAnswered } = await (await database.ref(`rooms/${roomId}/questions/${questionId}`).once('value')).val();

    if (isAnswered) {
      await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
        isAnswered: false,
      });
    } else {
      await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
        isAnswered: true,
      });
    }
  }

  async function handleHighlightQuestion(questionId: string) {
    const { isHighlighted } = await (await database.ref(`rooms/${roomId}/questions/${questionId}`).once('value')).val();

    if (isHighlighted) {
      await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
        isHighlighted: false,
      });
    } else {
      await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
        isHighlighted: true,
      });
    }
  }

  async function handleEndRoom() {
    if (window.confirm('Tem certeza que deseja encerrar essa sala')) {
      await database.ref(`rooms/${roomId}`).update({
        endedAt: new Date(),
      })
    }

    history.push('/');
  }

  return (
    <div id="page-room">
      <header>
        <div className="content">
          <img src={logoImg} alt="Letmeask" />
          <div>
            <RoomCode code={roomId} />
            <Button onClick={handleEndRoom} isOutlined>Encerrar sala</Button>
          </div>
        </div>
      </header>

      <main>
        <div className="room-title">
          <h1>Sala {title}</h1>
          {questions.length > 0 && <span>{questions.length} pergunta(s)</span>}
        </div>

        <div className="question-list">
          {questions.length === 0 ?
            <div className="empty-questions">
              <img src={emptyQuestionsImg} alt="Nenhuma questão cadastrada" />
              <h2>Nenhuma pergunta por aqui...</h2>
              <p>Envie o código desta sala para os seus amigos e começe a responder perguntas!</p>
            </div>
            :
            questions.map(question => (
              <Question
                key={question.id}
                content={question.content}
                author={question.author}
                isAnswered={question.isAnswered}
                isHighlighted={question.isHighlighted}
              >
                <button
                  type="button"
                  onClick={() => handleCheckQuestionAsAnswered(question.id)}
                >
                  <img src={checkImg} alt="Marcar pergunta como respondida" />
                </button>
                <button
                  type="button"
                  onClick={() => handleHighlightQuestion(question.id)}
                >
                  <img src={answerImg} alt="Dar destaque à pergunta" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(question.id)}
                >
                  <img src={deleteImg} alt="Remover pergunta" />
                </button>
              </Question>
            ))}
        </div>
      </main>
    </div>
  );
}