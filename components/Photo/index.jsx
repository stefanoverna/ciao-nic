const imgWithClick = { cursor: "pointer" };
import { Image } from "react-datocms";
import s from "./style.module.css";

const Photo = (props) => {
  const { index, onClick, photo, margin, direction, top, left, key } = props;
  const imgStyle = { margin: margin, display: "block", ...photo };

  if (direction === "column") {
    imgStyle.position = "absolute";
    imgStyle.left = left;
    imgStyle.top = top;
  }

  const handleClick = (event) => {
    onClick(event, { photo, index });
  };

  return (
    <div
      style={onClick ? { ...imgStyle, ...imgWithClick } : imgStyle}
      onClick={onClick ? handleClick : null}
      key={key}
    >
      <Image className={s.image} data={photo.responsiveImage} />
    </div>
  );
};

export default Photo;
