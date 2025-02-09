import { info } from "@tauri-apps/plugin-log";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

type AudioAnimatedIconProps = {
  playing?: boolean;
  size: number;
  rotate?: number;
};

export default function AudioAnimatedIcon({
  playing,
  size,
  rotate = 0,
}: AudioAnimatedIconProps) {
  const controls1 = useAnimation();
  const controls2 = useAnimation();
  const controls3 = useAnimation();

  // 定义动画序列
  // const circleAnimation = {
  //   visible: { opacity: 1 },
  //   hidden: { opacity: 0 },
  // };

  useEffect(() => {
    info(`playing: ${playing}`)
    if (playing) {
      controls1.start({
        opacity: [0, 1, 1, 0],
        transition: {
          duration: 1.5,
          times: [0, 0.33, 1, 1],
          delay: 0,
          repeat: Infinity,
        },
      });

      controls2.start({
        opacity: [0, 0, 1, 1, 0],
        transition: {
          duration: 1.5,
          times: [0, 0.33, 0.66, 1, 1],
          delay: 0,
          repeat: Infinity,
        },
      });

      controls3.start({
        opacity: [0, 0, 1, 0],
        transition: {
          duration: 1.5,
          times: [0, 0.66, 1, 1],
          delay: 0,
          repeat: Infinity,
        },
      });
    } else {
      [controls1, controls2, controls3].forEach(control => {
        control.stop();
        control.set({ opacity: 0 });
      });
    }
  }, [playing]);

  return (
    <motion.svg
      height={size}
      width={size}
      viewBox="0 0 100 100"
      style={{ rotate: rotate }}
    >
      <defs>
        <clipPath id="myClipPath">
          <polygon points="50,50 100,20 100,80 50,50" />
        </clipPath>
      </defs>

      <g clipPath="url(#myClipPath)">
        <rect x={0} y={0} width={100} height={100} fill="white" />

        {/* 第三个圆（最外层） */}
        <motion.circle
          cx={50}
          cy={50}
          r={45}
          strokeWidth={10}
          stroke="black"
          fill="none"
          initial={{ opacity: 0 }}
          animate={controls3}
          // variants={circleAnimation}
        />

        {/* 第二个圆（中间层） */}
        <motion.circle
          cx={50}
          cy={50}
          r={30}
          strokeWidth={10}
          stroke="black"
          fill="none"
          initial={{ opacity: 0 }}
          animate={controls2}
          // variants={circleAnimation}
        />

        {/* 第一个圆（最内层） */}
        <motion.circle
          cx={50}
          cy={50}
          r={20}
          fill="black"
          initial={{ opacity: 0 }}
          animate={controls1}
          // variants={circleAnimation}
        />
      </g>
    </motion.svg>
  );
}