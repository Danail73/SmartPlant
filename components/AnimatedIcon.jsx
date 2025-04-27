import { useEffect, useRef } from 'react';
import LottieView from 'lottie-react-native';

const AnimatedIcon = ({ isVisible, iconSource, width, height }) => {
  const animationRef = useRef(null);

  //play icon's animation every time it shows
  useEffect(() => {
    if (isVisible && animationRef.current) {
      animationRef.current.play(); 
    }
  }, [isVisible]); 

  //returning LottieView
  return (
    <LottieView
      ref={animationRef}
      source={iconSource}
      autoPlay={false}
      loop={false}
      style={{ width: width, height: height }}
    />
  );
};

export default AnimatedIcon 
