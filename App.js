import React, { useEffect, useRef, useState } from 'react';
import { View, PanResponder, StyleSheet, Text, Animated, Easing,TouchableOpacity } from 'react-native';
import { CheckBox } from 'react-native-elements';


const MultiFingerTouchDetector = () => {
  const [fingerPositions, setFingerPositions] = useState([]);
  const [fingers, setFingers]=useState(0);
  const [segundos, setSegundos] = useState(11);
  const [selectedFinger,setSelectedFinger]=useState();
  const [help,setHelp]=useState(false);
  const [tap,setTap]=useState(0);
  const [lastTouchTime,setLastTouchTime]=useState(0);
  const [touchCount,setTouchCount]=useState(1);
  const [ToD, setToD]=useState('random');
  const [ToF,setToF]=useState(false);
  const [finished,setFinished]=useState(true);    

  const Checkbox = () => {
    const [isChecked, setChecked] = useState(false);
  
    const handleCheckboxPress = () => {
      setChecked(!isChecked);
      console.log("clicked")
    };
  
    return (
      <TouchableOpacity onPress={handleCheckboxPress}>
        <View style={isChecked ? styles.checkedBox : styles.uncheckedBox} />
      </TouchableOpacity>
    );
  };
  

  

  const breathingScale = useRef(new Animated.Value(1.2)).current;
  const breathingOpacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (event) => {
        const touches = event.nativeEvent.touches;
        const positions = getTouchPositions(touches);
        setFingerPositions(positions);
        startBreathingAnimation();
      },
      onPanResponderMove: (event) => {
        const touches = event.nativeEvent.touches;
        const positions = getTouchPositions(touches);
        setFingerPositions(positions);
      },
      onPanResponderRelease: () => {
        setFingerPositions([]);
        stopBreathingAnimation();
      },
      onPanResponderTerminate: () => {
        setFingerPositions([]);
        stopBreathingAnimation();
      },
    })
  ).current;

  const getTouchPositions = (touches) => {
    return touches.map((touch) => ({
      identifier: touch.identifier,
      x: touch.pageX,
      y: touch.pageY,
    }));
  };

  const startBreathingAnimation = () => {
    console.log('Starting breathing animation');
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(breathingScale, {
            toValue: 1.5,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(breathingScale, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(breathingOpacity, {
            toValue: 0.5, 
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(breathingOpacity, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
      { iterations: -1 }
    ).start();
  };

  const stopBreathingAnimation = () => {
    console.log('Stopping breathing animation');
    breathingScale.stopAnimation();
    breathingScale.setValue(1.2);
    breathingOpacity.stopAnimation();
    breathingOpacity.setValue(1);
  };



  useEffect(() => {
    setFingers(fingerPositions.length)
  }, [fingerPositions]);

  useEffect(() => {
    console.log("Cantidad de dedos:", fingers);

    let intervalId;
    let timeoutId;
  
    const DOUBLE_TAP_INTERVAL = 300;
  
    if (!finished) {
      // Game is not finished, do not proceed
      return;
    }
  
    if (fingers === 1) {
      const currentTime = Date.now();
      if (currentTime - lastTouchTime <= DOUBLE_TAP_INTERVAL) {
        setTouchCount(touchCount+1)
        if (touchCount+1 === 4) {
          setToD('chosen')
        }
        if (touchCount+1 === 3) {
          setToD('random')
        }
        if (touchCount+1 === 2) {
          if(ToF){
            console.log("Doble toque");
            setToD('truth')
            setToF(false)
          }else{
              console.log("Doble toque");
              setToD('dare')
              setToF(true)
          }
        }

        
      } else {
        setTouchCount(1);
      }

      setLastTouchTime(currentTime);

    }
  
    if (fingers > 1) {
        if (timeoutId) {
          clearTimeout(timeoutId);
          console.log('Cleared timeout for single finger detection');
        }

    
        console.log('Starting contador');
        console.log("ToD element: "+ToD);
        console.log(finished)
        // setToD(null);
        setSelectedFinger(0);
        console.log(selectedFinger);
    
        intervalId = setInterval(() => {
          const randomToD = Math.random();
          setSegundos((prevSegundos) => {
            if (prevSegundos === 1) {
              const selectedF = Math.floor(Math.random() * fingers) + 1;
              let message=null;
              console.log(ToD)
              if(ToD==='random'){
                console.log("el valor es nulo")
                setToD(randomToD < 0.5 ? 'truth' : 'dare');
                setTimeout(() => {
                  setToD('random')
                  setFinished(true);
                }, 5000);
              }else{
                console.log("el valor no es nulo")
              }
              console.log("ToD es:"+ToD)
  
              setSelectedFinger(selectedF);
              // console.log('Mensaje aleatorio:', message);
              clearInterval(intervalId);  // Detiene el intervalo cuando segundos es igual a 0
    
              return 11;  // Reinicia el contador a 11 cuando segundos es igual a 1
            }
            return prevSegundos - 1;
          });
        }, 1000);
    }
  
    return () => {
      if (intervalId) {
        console.log('Clearing interval');
        clearInterval(intervalId);
      }
      
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [fingers, setSegundos]);
  
  
  
  
  


  return (
    
    <View
      {...panResponder.panHandlers}
      style={[
        styles.container,
        { backgroundColor: ToD === 'truth' ? 'green' : ToD === 'dare' ? 'red' : ToD === 'chosen' ? 'purple' : 'orange'},
      ]}
    >
      {/* <Checkbox /> */}
      {fingerPositions.map((position) => {
        if (selectedFinger > 0) {
          if (position.identifier === selectedFinger-1) {
            return (
              <Animated.View
                key={position.identifier}
                style={[
                  styles.cursor,
                  {
                    left: position.x - 60,
                    top: position.y - 60,
                    transform: [
                      { scale: breathingScale },
                      { perspective: 1000 },
                    ],
                    opacity: breathingOpacity,
                  },
                ]}
              />
            );
          } else {
            return null;  // Oculta los dedos no seleccionados
          }
        } else {
          return (
            <Animated.View
              key={position.identifier}
              style={[
                styles.cursor,
                {
                  left: position.x - 60,
                  top: position.y - 60,
                  transform: [
                    { scale: breathingScale },
                    { perspective: 1000 },
                  ],
                  opacity: breathingOpacity,
                },
              ]}
            />
          );
        }
      })}
      
      {segundos > 0 && (
        <View style={styles.timerContainer}>
          {segundos < 11 && <Text style={styles.timer}>{`${segundos}`}</Text>}
        </View>
      )}
      <View>
        <Text style={styles.ToD}>{ToD}</Text>
      </View>
    </View>
  );
  

  

  
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'orange',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cursor: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 60,
    backgroundColor: 'white',
  },
  timerContainer: {
    position: 'absolute',
    top:80
  },
  timer: {
    color: 'white',
    fontSize: 50,
  },
  ToD: {
    color: 'white',
    fontSize: 50,
    fontWeight:'bold'
  },
});

export default MultiFingerTouchDetector;
