import React, { useState, useCallback } from "react";
import Head from "next/head";
import { request } from "../utils/datoServer";
import { Form } from "../components/Form";
import s from "../styles/index.module.css";
import { metaTagsFragment, responsiveImageFragment } from "../utils/fragments";
import { useQuerySubscription } from "react-datocms";
import Gallery from "react-photo-gallery";
import Photo from "../components/Photo";
import Carousel, { Modal, ModalGateway } from "react-images";

export async function getServerSideProps({ preview }) {
  const graphqlRequest = {
    query: `
      {
        site: _site {
          favicon: faviconMetaTags {
            ...metaTagsFragment
          }
        }
        allMessages(orderBy: _createdAt_DESC) {
          id
          author
          message
          relationship
          _createdAt
          gallery {
            src: url
            width
            height
            responsiveImage(imgixParams: {fm: jpg, w: 2000 }) {
              ...responsiveImageFragment
            }
          }
        }
      }

      ${metaTagsFragment}
      ${responsiveImageFragment}
    `,
    preview: !!preview,
  };

  return {
    props: {
      subscription: {
        ...graphqlRequest,
        initialData: await request(graphqlRequest),
        token: "2a368ab0134453224b632af0d9a702",
      },
    },
  };
}

const format = (str) =>
  str.split(/(\r\n|\r|\n)/g).map(function (line, index) {
    if (line.match(/(\r\n|\r|\n)/g)) {
      return React.createElement("br", { key: index });
    }
    return line;
  });

export default function Home({ subscription }) {
  const {
    data: { allMessages, site },
  } = useQuerySubscription(subscription);

  const [currentImage, setCurrentImage] = useState(0);
  const [viewerIsOpen, setViewerIsOpen] = useState(false);

  const allPhotos = allMessages.map((message) => message.gallery).flat();

  const handleOpenLightbox = useCallback((_event, { photo }) => {
    setCurrentImage(allPhotos.findIndex((p) => p.src === photo.src));
    setViewerIsOpen(true);
  }, []);

  const closeLightbox = () => {
    setCurrentImage(0);
    setViewerIsOpen(false);
  };

  return (
    <div className={s.container}>
      <Head>
        <title>Ciao Nic</title>
      </Head>

      <h1 className={s.title}>Ciao Nic ❤️</h1>

      <div className={s.aside}>
        <div className={s.form}>
          <div className={s.subtitle}>Lascia il tuo ricordo</div>

          <Form />
        </div>
      </div>

      <div className={s.messages}>
        <div className={s.subtitle}>Leggi tutti i ricordi</div>

        {allMessages.map((message) => (
          <React.Fragment key={message.id}>
            <article className={s.message}>
              <div className={s.messageContent}>
                {format(message.message)}
                <p className={s.messageAuthor}>{message.author}</p>
              </div>
              {message.relationship && (
                <div className={s.messageRelationship}>
                  <div className={s.messageRelationshipTitle}>
                    Come hai conosciuto Matteo?
                  </div>
                  {format(message.relationship)}
                </div>
              )}
              {message.gallery.length > 0 && (
                <div className={s.messageGallery}>
                  <Gallery
                    photos={message.gallery}
                    renderImage={Photo}
                    targetRowHeight={100}
                    margin={5}
                    onClick={handleOpenLightbox}
                  />
                </div>
              )}
            </article>
            <div className={s.separator} />
          </React.Fragment>
        ))}
      </div>
      <ModalGateway>
        {viewerIsOpen ? (
          <Modal onClose={closeLightbox}>
            <Carousel currentIndex={currentImage} views={allPhotos} />
          </Modal>
        ) : null}
      </ModalGateway>
    </div>
  );
}
