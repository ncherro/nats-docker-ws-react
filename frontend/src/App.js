import React, { Component } from 'react';
import './App.css';
import wsNats from 'websocket-nats';

const MT_COMMENT = 'comment';
const MT_TYPING = 'typing';
const MT_TYPING_STOPPED = 'typing_stopped';
const TYPING_TIMEOUT = 2000;

const currentSecond = () => {
  return new Date().getTime() / 1000;
}

class App extends Component {
  constructor(props) {
    super(props);

    this.channel = process.env.REACT_APP_CHANNEL;
    this.nats = wsNats.connect(`ws://${process.env.REACT_APP_NATS_HOST}`);

    this.state = {
      messages: [],
      typers: [],
      value: '',
      lastTyped: currentSecond()
    };

    this.typingStopped = this.typingStopped.bind(this);
    this.publish = this.publish.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.nats.subscribe(this.channel, (msg) => {
      let message = JSON.parse(msg);
      let { typers, messages } = this.state;
      switch(message.type) {
        case MT_COMMENT:
          messages.unshift(message);
          this.setState({ messages });
          break;
        case MT_TYPING:
          let { user } = message;
          if (
            user !== this.props.user &&
            typers.indexOf(message.user) === -1
          ) {
            this.setState({ typers: typers.concat([user])})
          }
          break;
        case MT_TYPING_STOPPED:
          let idx = typers.indexOf(message.user);
          if (idx !== -1) {
            let newTypers = [...typers]
            newTypers.splice(idx, 1);
            this.setState({ typers: newTypers })
          }
          break;
        default:
          console.warn(`Unknown message type: ${message.type}`);
      }
    });
  }

  publish(message) {
    let { user } = this.props;
    this.nats.publish(this.channel, JSON.stringify({
      ...message,
      user
    }));
  }

  handleChange(e) {
    this.setState({
      value: e.target.value,
      lastTyped: currentSecond()
    });
    this.publish({ type: MT_TYPING });
    setTimeout(this.typingStopped, TYPING_TIMEOUT);
  }

  typingStopped() {
    if ((currentSecond() - this.state.lastTyped) > 1) {
      this.publish({ type: MT_TYPING_STOPPED });
    } else {
      setTimeout(this.typingStopped, TYPING_TIMEOUT);
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    if (!this.state.value) return;
    this.publish({ type: MT_COMMENT, comment: this.state.value });
    this.setState({ value: '' });
    this.publish({ type: MT_TYPING_STOPPED });
  }

  renderTypers() {
    let { typers } = this.state;
    switch(typers.length) {
      case 0:
        return;
      case 1:
        return `${typers[0]} is typing...`
      case 2:
        return `${typers[0]} and ${typers[1]} are typing...`
      default:
        return 'Many people are typing...'
    }
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Real timing over NATS</h2>
        </div>
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            name="message"
            value={this.state.value}
            onChange={this.handleChange}
            autoComplete="off"
          ></input>
          <br />
          <small>{this.renderTypers()}</small>
        </form>
        <div>
          <ul>
            {this.state.messages.map((message, idx) => {
              return (
                <li
                  key={idx}
                  className={message.user === this.props.user ? 'me' : 'other'}
                >{message.comment} - <small>{message.user}</small></li>
              )
            })}
          </ul>
        </div>
      </div>
    );
  }
}

export default App;
