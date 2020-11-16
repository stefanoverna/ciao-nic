import cn from "classnames";
import dato from "../../utils/datoClient";
import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import s from "./style.module.css";

const baseStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "10px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const activeStyle = {
  borderColor: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const rejectStyle = {
  borderColor: "#ff1744",
};

const GalleryInput = ({ value: uploads, onChange }) => {
  const [tempUploads, setTempUploads] = useState({});
  const latestUploads = useRef();

  useEffect(() => {
    latestUploads.current = uploads;
  }, [uploads]);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const idFileTuples = [];

      for (let file of acceptedFiles) {
        const id = "" + Date.now();

        idFileTuples.push([id, file]);

        setTempUploads((tempUploads) => ({
          ...tempUploads,
          [id]: {
            id,
            progress: 0,
            preview: URL.createObjectURL(file),
            progress: "In coda!",
          },
        }));
      }

      for (let [id, file] of idFileTuples) {
        setTempUploads((tempUploads) => ({
          ...tempUploads,
          [id]: { ...tempUploads[id], progress: "Parto con l'upload!" },
        }));

        const path = await dato.createUploadPath(file, {
          onProgress: (event) => {
            const { type, payload } = event;
            if (type === "upload") {
              setTempUploads((tempUploads) => ({
                ...tempUploads,
                [id]: {
                  ...tempUploads[id],
                  progress: `Upload in corso: ${payload.percent}%`,
                },
              }));
            }
          },
        });

        setTempUploads((tempUploads) => ({
          ...tempUploads,
          [id]: { ...tempUploads[id], progress: "Finalizzo l'upload..." },
        }));

        const upload = await dato.uploads.create({ path });

        setTempUploads((tempUploads) => {
          var clone = { ...tempUploads };
          delete clone[id];
          return clone;
        });

        onChange([upload, ...latestUploads.current]);
      }
    },
    [uploads]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({ accept: "image/*", onDrop });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept]
  );

  const allUploads = Object.values(tempUploads).concat(uploads);

  return (
    <>
      {allUploads.length > 0 && (
        <ul className={s.list}>
          {allUploads.map((uploadOrTempUpload) => (
            <li key={uploadOrTempUpload.id} className={s.item}>
              <img
                src={uploadOrTempUpload.preview || uploadOrTempUpload.url}
                className={cn(s.image, {
                  [s.imagePending]: !!uploadOrTempUpload.preview,
                })}
              />
              {"progress" in uploadOrTempUpload && (
                <span className={s.progress}>
                  {uploadOrTempUpload.progress}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Rilascia i file qui!</p>
        ) : (
          <p>Trascina i tuoi file, o clicca per Sfogliare</p>
        )}
      </div>
    </>
  );
};

export default GalleryInput;
