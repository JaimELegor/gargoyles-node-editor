import "../styles/CPUFlag.css";
import { useMode } from "../contexts/ModeContext";

export default function CPUFlagButton() {
  const { setCPUFlag, cpuFlag } = useMode();
  return (
        <div className={'toggle-' + (cpuFlag ? 'off' : 'on')} onClick={() => setCPUFlag(!cpuFlag)} />
    );
}