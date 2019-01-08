import React, {Component, PureComponent} from 'react';
import PropTypes from 'prop-types';
import { Call, ToFixed, TimeFormat } from 'basic-helper';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { Grid } from '../../core/grid';

const timeTitleMapper = {
  hour: '时',
  min: '分',
  sec: '秒'
};

const AnimatedCard = ({ position, animation, digit, style }) => {
  return(
    <div className={`flip-card ${position} ${animation}`} style={style}>
      <span className="count">{digit}</span>
    </div>
  );
};

const StaticCard = ({ position, digit, style }) => {
  return(
    <div className={position} style={style}>
      <span className="count">{digit}</span>
    </div>
  );
};

let FlipShuffleCache = {
  hour: true,
  min: true,
  sec: true,
};
let FlipDigitCache = {};

const FlipUnitContainer = ({
  digit, unit, increase = false,
  width = 140, height = 120, flipItemStyle
}) => {	
  
  // assign digit values
  let currentDigit = +digit;
  let previousDigit = +digit + (increase ? -1 : 1);

  // to prevent a negative value
  if ( unit !== 'hour') {
    previousDigit = previousDigit === -1 ? 59 : previousDigit;
    previousDigit = previousDigit === 60 ? '00' : previousDigit;
  } else {
    previousDigit = previousDigit === -1 ? 23 : previousDigit;
  }

  // if(unit == 'min') {
  //   console.log(previousDigit)
  // }

  // add zero
  if ( currentDigit !== '00' && currentDigit < 10 ) {
    currentDigit = `0${currentDigit}`;
  } 
  if ( previousDigit !== '00' && previousDigit < 10 ) {
    previousDigit = `0${previousDigit}`;
  }
  let preDigitFormCache = FlipDigitCache[unit];
  let shuffle = FlipShuffleCache[unit];


  // if(unit == 'sec') {
  //   console.log(shuffle)
  // }
  if(currentDigit == preDigitFormCache) {
    shuffle = !shuffle;
  } else {
    FlipShuffleCache[unit] = !shuffle;
  }
  FlipDigitCache[unit] = currentDigit;

  // shuffle digits
  const digit1 = shuffle ? previousDigit : currentDigit;
  const digit2 = !shuffle ? previousDigit : currentDigit;

  // shuffle animations
  const animation1 = shuffle ? 'fold' : 'unfold';
  const animation2 = !shuffle ? 'fold' : 'unfold';

  const scaleStyle = {
    height, width, fontSize: height / 1.3
  };
  const styleForAnimate = {
    ...flipItemStyle,
    height: height / 2,
    width,
  };

  return (
    <div className="flip-unit-container" style={scaleStyle}>
      <StaticCard 
        position="before" 
        style={flipItemStyle}
        digit={currentDigit}/>
      <StaticCard 
        position="now" 
        style={flipItemStyle}
        digit={previousDigit}/>
      <AnimatedCard 
        style={styleForAnimate}
        position="first"
        digit={digit1}
        animation={animation1}/>
      <AnimatedCard 
        style={styleForAnimate}
        position="second"
        digit={digit2}
        animation={animation2}/>
    </div>
  );
};

export default class Countdown extends Component {
  static propTypes = {
    /** 倒计时开始时间 */
    start: PropTypes.number.isRequired,
    /** 每一个 flip 的宽度 */
    width: PropTypes.number,
    /** 每一个 flip 的高度 */
    height: PropTypes.number,
    /** 给每一个 flip 的 style */
    flipItemStyle: PropTypes.shape({}),
    /** 需要广播的时间节点 */
    countdownNotifyTimer: PropTypes.number,
    /** 广播的时间节点触发的回调 */
    onCountdownNotify: PropTypes.func,
    /** 时间到 0 的时候触发的回调 */
    onTimeout: PropTypes.func.isRequired
  };
  static defaultProps = {
    width: 140,
    height: 120,
  };
  isTimerStart = false;
  constructor(props) {
    super(props);
    this.state = {
      // isTimerStart: false,
      countdown: -1
    };
  }
  startCountdown() {
    const { start } = this.props;
    if (this.isTimerStart || start === 0) return;
    this._clearTimer();
    this.interval = this.startTimer();
  }
  setJumpElemCount(timeObj) {
    if(!this.jumpElem) return;

    this.jumpElem.innerHTML = `${timeObj.hour}:${timeObj.min}:${timeObj.sec}` || 0;
  }
  // componentWillReceiveProps(nextProps) {
  //   if(nextProps.start !== this.props.start) {
  //     this.clearTimer();
  //   }
  // }
  shouldComponentUpdate(nextProps, nextState) {
    const isReceiveNewStart = this.props.start !== nextProps.start;
    const isNewCount = this.state.countdown !== nextState.countdown;
    if(nextProps.start !== this.props.start) {
      this.clearTimer();
    }
    return isNewCount ||
           !nextState.isTimeout ||
           isReceiveNewStart;
  }
  componentDidMount() {
    this.startCountdown();
  }
  componentDidUpdate() {
    this.startCountdown();
  }

  _clearTimer() {
    this.interval && clearInterval(this.interval);
    this.interval = null;
  }

  clearTimer() {
    this._clearTimer();
    this.isTimerStart = false;
    // this.setState({
    //   isTimerStart: false
    // });
  }
  componentWillUnmount() {
    this.clearTimer();
  }
  startTimer() {
    // if (this.state.isTimerStart) return;
    const {
      start,
      countdownNotifyTimer,
      onCountdownNotify, onTimeout
    } = this.props;
    let countdown = start - 1;
    this.isTimerStart = true;
    this.setState({
      // isTimerStart: true,
      countdown: countdown
    });
    let oneRound = setInterval(() => {
      countdown--;
      this.setState({
        countdown: (countdown < 0) ? 0 : countdown
      });
      if(countdown == +countdownNotifyTimer) Call(onCountdownNotify, countdown);
      if(countdown === -1) {
        onTimeout();
        // clearInterval(oneRound);
        // this.setState({
        //   isTimerStart: false,
        //   isTimeout: true
        // });
      }
    }, 1000);
    return oneRound;
  }
  render () {
    const { width, height, countdownNotifyTimer, onCountdownNotify, onTimeout, flipItemStyle, className, ...other } = this.props;
    const { countdown } = this.state;
    const timeObj = TimeFormat(countdown);

    this.setJumpElemCount(timeObj);
    const hasCountdown = countdown != -1;

    const container = !hasCountdown ? <span /> : (
      <section className={"flip-clock " + (className ? className : '')}>
        <Grid container>
          {
            Object.keys(timeObj).map((unit, idx) => {
              let currTime = timeObj[unit];
              return (
                <Grid key={unit} {...other}>
                  <FlipUnitContainer
                    unit={unit}
                    flipItemStyle={flipItemStyle}
                    width={width}
                    height={height}
                    digit={currTime} />
                </Grid>
              );
            })
          }
        </Grid>
      </section>
    );

    return (
      <TransitionGroup component={null}>
        <CSSTransition
          key={hasCountdown ? 'has' : 'none'}
          classNames="fade"
          timeout={200}>
          {container}
        </CSSTransition>
      </TransitionGroup>
    );
  }
}