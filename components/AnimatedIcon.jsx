import { useEffect, useRef } from 'react';
import LottieView from 'lottie-react-native';

const AnimatedIcon = ({ isVisible, iconSource, width, height }) => {
  const animationRef = useRef(null);

  useEffect(() => {
    if (isVisible && animationRef.current) {
      animationRef.current.play(); 
    }
  }, [isVisible]); 

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
