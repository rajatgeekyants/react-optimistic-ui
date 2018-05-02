import React, {Component} from 'react';
import {Tweet} from './Tweet';

const shouldFail = id => [2].includes(id);

// Fake request.
function likeTweetRequest(tweetId, like) {
  console.log(`HTTP /like_tweet/${tweetId}?like=${like} (begin)`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const shouldSucceed = !shouldFail(tweetId);
      console.log(
        `HTTP /like_tweet/${tweetId}?like=${like} (${
          shouldSucceed ? 'success' : 'failure'
        })`
      );
      shouldSucceed ? resolve() : reject();
    }, 1000);
  });
}

const initialState = {
  tweets: [0, 3].map((likes, i) => ({
    id: i + 1,
    likes,
    username: 'Rajat S',
    content: `${
      shouldFail(i + 1) ? 'Peter Parker is Spiderman' : 'Bruce Wayne is Batman'
    }`,
  })),
  likedTweets: [2],
};

function setTweetLiked(tweetId, newLiked) {
  return state => {
    return {
      tweets: state.tweets.map(
        tweet =>
          tweet.id === tweetId
            ? {...tweet, likes: tweet.likes + (!newLiked ? -1 : 1)}
            : tweet
      ),
      likedTweets: !newLiked
        ? state.likedTweets.filter(id => id !== tweetId)
        : [...state.likedTweets, tweetId],
    };
  };
}

class App extends Component {
  state = initialState;

  likeRequestPending = false;

  onClickLike = tweetId => {
    console.log(`Clicked like: ${tweetId}`);

    if (this.likeRequestPending) {
      console.log('Request already pending! Do nothing.');
      return;
    }

    console.log(`Update state: ${tweetId}`);

    const isLiked = this.state.likedTweets.includes(tweetId);
    this.setState(setTweetLiked(tweetId, !isLiked));
    this.likeRequestPending = true;

    likeTweetRequest(tweetId, true)
      .then(() => {
        console.log(`then: ${tweetId}`);
      })
      .catch(() => {
        console.error(`catch: ${tweetId}`);
        this.setState(setTweetLiked(tweetId, isLiked));
      })
      .then(() => {
        this.likeRequestPending = false;
      });
  };

  render() {
    const {tweets, likedTweets} = this.state;
    return (
      <div className="container">
        <h3 className="text-muted text-center lead pt-2">
          Optimistic User Interface in React
        </h3>
        <div className="list-group">
          {tweets.map(tweet => (
            <Tweet
              key={tweet.id}
              tweet={tweet}
              isLiked={likedTweets.includes(tweet.id)}
              onClickLike={this.onClickLike}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default App;
