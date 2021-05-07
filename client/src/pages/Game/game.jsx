import "./game.css";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import arrowIcon from "../../assets/icons/double-arrow.svg";
import { io } from "socket.io-client";
import { userContext } from "../../context/user.context";

const Game = () => {
  const { gameId } = useParams();

  const [socket, setSocket] = useState(null);
  const [text, setText] = useState("");
  const [comments, setComments] = useState([]);
  const [rating, setRating] = useState(0);
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(userContext);

  useEffect(() => {
    fetch("http://localhost:3000/games/" + gameId)
      .then((res) => {
        res.json().then((game) => {
          setGameData(game);
          setLoading(false);
        });
      })
      .catch((err) => console.log(err));
  }, [gameId]);

  useEffect(() => {
    const socket = io("ws://localhost:3000");
    socket.on("connect_error", (m) => {
      console.log("error", m);
    });
    socket.on("connect", () => {
      console.log("socket.io connection open");
      socket.send({ type: "comments", gameId });
      socket.send({ type: "rating", gameId });
    });
    socket.on("message", (msg) => {
      switch (msg.type) {
        case "comments":
          console.log(msg.comments);
          setComments(msg.comments);
          break;

        case "rating":
          console.log(msg.value);
          setRating(msg.value);
          break;
        default:
          break;
      }
    });
    setSocket(socket);
    return () => {
      socket.disconnect();
      console.log("socket.io disconnected");
    };
  }, [gameId]);

  if (loading) {
    return <h1 className="game__warning">Loading...</h1>;
  }

  const renderPrice = () => {
    if (gameData.price)
      return (
        <input
          className="picture__button"
          type="button"
          value="Buy now"
        ></input>
      );
    return (
      <input className="picture__button" type="button" value="Play now"></input>
    );
  };

  const handleCommentDeletion = (commentId) => {
    socket.send({ type: "delete-comment", commentId, gameId });
  };

  const renderComments = () =>
    comments.map((comment) => {
      return (
        <div key={comment._id} className="comments__div">
          {user ? (
            user.data.nickname === comment.nickname ? (
              <button
                onClick={() => handleCommentDeletion(comment._id)}
                className="comments__button_delete"
              />
            ) : (
              ""
            )
          ) : (
            ""
          )}
          <h5 className="comments__username">{comment.nickname}</h5>
          <p className="comments__text">{comment.text}</p>
        </div>
      );
    });

  const sendComment = () => {
    socket.send({
      type: "add-comment",
      gameId,
      nickname: user.data.nickname,
      text,
    });
    setText("");
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const renderRating = () => {
    return (
      <div className="rating__list">
        <button
          onClick={() => sendRating(1)}
          className={
            rating > 0 ? "rating__star rating__star_set" : "rating__star"
          }
        ></button>
        <button
          onClick={() => sendRating(2)}
          className={
            rating > 1 ? "rating__star rating__star_set" : "rating__star"
          }
        ></button>
        <button
          onClick={() => sendRating(3)}
          className={
            rating > 2 ? "rating__star rating__star_set" : "rating__star"
          }
        ></button>
        <button
          onClick={() => sendRating(4)}
          className={
            rating > 3 ? "rating__star rating__star_set" : "rating__star"
          }
        ></button>
        <button
          onClick={() => sendRating(5)}
          className={
            rating > 4 ? "rating__star rating__star_set" : "rating__star"
          }
        ></button>
      </div>
    );
  };

  const sendRating = (value) => {
    socket.send({ type: "add-rating", gameId, value });
  };

  return (
    <>
      <div className="game__content">
        <div className="game__picture">
          <img className="picture__img" src={gameData.imageUrl} alt="game" />
          <h1 className="picture__header">{gameData.title}</h1>
          {renderPrice()}
        </div>
        <ul className="game__ul">
          <li>
            <p className="game__p">Platform: {gameData.platform}</p>
          </li>
          <li>
            <p className="game__p">Genre: {gameData.genre}</p>
          </li>
          <li>
            <p className="game__p"> Maturity rating: {gameData.maturity}+</p>
          </li>
        </ul>
      </div>
      <div className="game__description">
        <p className="description__p_about">About</p>
        <p className="description__p_title">{gameData.title}</p>
        <img className="description__arrow" src={arrowIcon} alt="" />
        <p className="description__p_desc">{gameData.desc}</p>
      </div>
      <div className="game__rating">
        <h3 className="rating__header">Rating</h3>
        {renderRating()}
      </div>
      <div className="game__comments">
        <h3 className="comments__header">Comments</h3>
        {renderComments()}
        {user ? (
          <div className="game__new-comment">
            <textarea
              className="new-comment__textarea"
              cols="30"
              rows="10"
              placeholder="Write your comment here..."
              value={text}
              onChange={handleTextChange}
            ></textarea>
            <button onClick={sendComment} className="new-comment__button">
              Post
            </button>
          </div>
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default Game;
