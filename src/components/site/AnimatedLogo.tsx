import { NeuralMark } from "@/components/brand/neural-motion/neural-mark";
const command = { id: 0, time: 0 };
export default function AnimatedLogo() {
  return <NeuralMark playing command={command} label="Nuro" />;
}
