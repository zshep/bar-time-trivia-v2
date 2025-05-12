import { useState, UseEffect } from "react";
import socket from "../main";
import { db, auth } from "../../app/server/api/firebase/firebaseConfig";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

export function useGameSession({ gameId,  sessionCode, hostId }) {

    return {
    // state
    currentQuestion,
    questionType,
    mcChoices,
    frAnswer,
    players,
    // metadata
    userId,
    hostId,
    // actions
    submitAnswer,
    nextQuestion,
    prevQuestion,
    endRound,
  };
}