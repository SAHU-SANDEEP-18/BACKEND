import {
  LuSparkles,
  LuMessageSquare,
  LuCompass,
  LuFolder,
  LuPlug,
  LuSettings,
  LuPencilLine,
  LuSearch,
  LuEllipsis,
  LuShare2,
  LuPaperclip,
  LuMic,
  LuArrowUp,
  LuMenu,
  LuX,
  LuPlus,
  LuCode,
  LuLightbulb,
  LuChartBar,
  LuLanguages,
  LuBookOpen,
  LuTrash2,
  LuCopy,
  LuCopyCheck,
  LuFileText,
  LuImage,
} from "react-icons/lu";
import { TfiReload } from "react-icons/tfi";
import { VscReply } from "react-icons/vsc";

const Icons = {
  sparkles: LuSparkles,
  message: LuMessageSquare,
  compass: LuCompass,
  folder: LuFolder,
  plug: LuPlug,
  settings: LuSettings,
  edit: LuPencilLine,
  pencil: LuPencilLine,
  search: LuSearch,
  dots: LuEllipsis,
  share: LuShare2,
  clip: LuPaperclip,
  mic: LuMic,
  arrowUp: LuArrowUp,
  menu: LuMenu,
  close: LuX,
  plus: LuPlus,
  code: LuCode,
  bulb: LuLightbulb,
  chart: LuChartBar,
  lang: LuLanguages,
  book: LuBookOpen,
  reload: TfiReload,
  copy: LuCopy,
  copyCheck: LuCopyCheck,
  reply: VscReply,
  trash: LuTrash2,
  fileText: LuFileText,
  image: LuImage,
};

const IconEl = ({ name, size = 18, color = "currentColor" }) => {
  const IconComponent = Icons[name];
  if (!IconComponent) return null;
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color,
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <IconComponent size={size} />
    </span>
  );
};

export default IconEl;