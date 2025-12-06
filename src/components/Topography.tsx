import React from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import Svg, {Path, Defs, LinearGradient, Stop} from 'react-native-svg';
import {colors} from '../theme/colors';

type Props = {
  width?: number | string;
  height?: number | string;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
};

export default function Topography({width = '100%', height = '100%', opacity = 1, style}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 450 450" style={[{opacity}, style]}>
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors.accent} stopOpacity="0.5" />
          <Stop offset="1" stopColor={colors.accent} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Path
        fill="none"
        stroke="url(#grad)"
        strokeWidth="1.5"
        d="M450,225C450,349.264,349.264,450,225,450S0,349.264,0,225,100.736,0,225,0,450,100.736,450,225Z"
      />
      <Path
        fill="none"
        stroke="url(#grad)"
        strokeWidth="1.5"
        d="M225,425c-110.457,0-200-89.543-200-200S114.543,25,225,25,425,114.543,425,225,335.457,425,225,425Z"
      />
      <Path
        fill="none"
        stroke="url(#grad)"
        strokeWidth="1.5"
        d="M225,400c-96.523,0-175-78.477-175-175S128.477,50,225,50s175,78.477,175,175S321.523,400,225,400Z"
      />
      <Path
        fill="none"
        stroke="url(#grad)"
        strokeWidth="1.5"
        d="M225,375c-82.591,0-150-67.409-150-150S142.409,75,225,75s150,67.409,150,150S307.591,375,225,375Z"
      />
      <Path
        fill="none"
        stroke="url(#grad)"
        strokeWidth="1.5"
        d="M225,350c-68.66,0-125-56.34-125-125S156.34,100,225,100s125,56.34,125,125S293.66,350,225,350Z"
      />
      <Path
        fill="none"
        stroke="url(#grad)"
        strokeWidth="1.5"
        d="M225,325c-55.228,0-100-44.772-100-100s44.772-100,100-100,100,44.772,100,100S280.228,325,225,325Z"
      />
      <Path
        fill="none"
        stroke="url(#grad)"
        strokeWidth="1.5"
        d="M225,300c-41.421,0-75-33.579-75-75s33.579-75,75-75,75,33.579,75,75S266.421,300,225,300Z"
      />
      <Path
        fill="none"
        stroke="url(#grad)"
        strokeWidth="1.5"
        d="M225,275c-27.614,0-50-22.386-50-50s22.386-50,50-50,50,22.386,50,50S252.614,275,225,275Z"
      />
    </Svg>
  );
}
