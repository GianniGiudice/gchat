import React, { useEffect, useRef, useState } from 'react';
import firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import logo from './logo.svg';
import './App.css';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCTOcgbLMMJzHXD6vRxlDh8tj1oU5u7cFY",
  authDomain: "gchat-1e0e9.firebaseapp.com",
  projectId: "gchat-1e0e9",
  storageBucket: "gchat-1e0e9.appspot.com",
  messagingSenderId: "695574937338",
  appId: "1:695574937338:web:27b090015f5cc8d3fc1343",
  measurementId: "G-FF74RTVHZS"
};

const auth = firebase.auth();
const firestore = firebase.firestore();

const SignIn = () => {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };
  return (
      <div>
        <button onClick={signInWithGoogle}>Sign In with Google</button>
      </div>
  );
};

const SignOut = () => {
  return auth.currentUser && (
      <div>
        <button onClick={() => auth.signOut()}>Sign Out</button>
      </div>
  )
};

const ChatRoom = () => {
  // we will use this to scroll to bottom of chat on page-reload and after sending a message
  const dummy = useRef();
  const scrollToBottom = () => {
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  // getting the message and sorting them by time of creation
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt', 'asc').limitToLast(25);

  const [messages] = useCollectionData(query, {idField: 'id'});

  const sendMessage = async (e) => {
    e.preventDefault();
    // gets name, userID and pfp of logged in user
    const { displayName, uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      user: displayName,
      body: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid: uid,
      photoURL: photoURL
    })

    // resetting form value and scrolling to bottom
    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  const ChatMessage = (props) => {
    const { user, body, uid, photoURL, createdAt } = props.message;

    return (
        <div>
          <div>
            <img src={photoURL || 'https://i.imgur.com/rFbS5ms.png'} alt="{user}'s pfp" />
          </div>
          <div>
            <p>{user}</p>
            <p>{body}</p>
          </div>
        </div>
    )
  };



  return (
      <div>
        <div>
          {/* we will loop over the message and return a
        ChatMessage component for each message */}
          {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
          <span ref={dummy}></span>
        </div>

        {/* Form to type and submit messages */}
        <form onSubmit={sendMessage}>
          <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Say something" />
          <button type="submit" disabled={!formValue}>send</button>
        </form>
      </div>
  )
};

const App = () => {
  const [user] = useAuthState(auth);

  return (
    <div>
      <SignOut />
      <section>
        { user ? <ChatRoom /> : <SignIn /> }
      </section>
    </div>
  );
};

export default App;
