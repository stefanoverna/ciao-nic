import cn from "classnames";
import { useCallback, useState } from "react";
import Textarea from "react-autosize-textarea";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
import { useToasts } from "react-toast-notifications";
import client from "../../utils/datoClient";
import GalleryInput from "../GalleryInput";
import s from "./style.module.css";

export const Field = ({ name, label, validations, children }) => {
  const context = useFormContext();
  const ref = context.register(validations);
  const { errors } = context;

  const error = errors[name];

  return (
    <div
      className={cn(s.field, {
        [s.fieldError]: error && error.message,
      })}
    >
      <label htmlFor={name} className={s.label}>
        {label}
      </label>

      {error && <div className={s.error}>{error.message}</div>}

      {children({ ...context, ref })}
    </div>
  );
};

export function Form() {
  const { addToast } = useToasts();
  const [pending, setPending] = useState(false);

  const methods = useForm({
    defaultValues: {
      author: "",
      message: "",
      relationship: "",
      gallery: [],
    },
  });

  const onSubmit = useCallback(
    async (values) => {
      setPending(true);

      await client.items.create({
        itemType: "409937",
        author: values.author,
        message: values.message,
        relationship: values.relationship,
        gallery: values.gallery.map((item) => ({ uploadId: item.id })),
      });

      addToast("Messaggio inviato!", {
        appearance: "success",
        autoDismiss: true,
      });

      methods.reset();

      setPending(false);
    },
    [methods]
  );

  return (
    <FormProvider {...methods}>
      <form
        className={s.form}
        onSubmit={methods.handleSubmit(onSubmit)}
        acceptCharset="utf-8"
      >
        <Field
          label="Autore"
          name="author"
          validations={{ required: "Il campo è obbligatorio" }}
        >
          {({ ref }) => (
            <input
              name="author"
              placeholder="Il tuo nome"
              ref={ref}
              className={s.input}
              disabled={pending}
            />
          )}
        </Field>
        <Field label="Come hai conosciuto Matteo?" name="relationship">
          {() => (
            <Controller
              name="relationship"
              as={Textarea}
              rows={3}
              placeholder="Scrivi come hai avuto la fortuna di incontrarlo! Dove, quando, perchè, grazie a chi?"
              className={s.textarea}
              control={methods.control}
              disabled={pending}
            />
          )}
        </Field>
        <Field label="Il tuo saluto" name="message">
          {() => (
            <Controller
              name="message"
              as={Textarea}
              rows={10}
              placeholder="Lascia il tuo saluto a Matteo e condividi qualcosa di lui."
              className={s.textarea}
              control={methods.control}
              disabled={pending}
              rules={{ required: "Il campo è obbligatorio" }}
            />
          )}
        </Field>
        <Field label="Hai qualche foto di Matteo che vorresti condividere?" name="gallery">
          {() => (
            <Controller
              name="gallery"
              as={GalleryInput}
              className={s.input}
              control={methods.control}
              disabled={pending}
            />
          )}
        </Field>
        <button type="submit" className={s.submitButton} disabled={pending}>
          {pending ? "Invio in corso..." : "Aggiungi il tuo ricordo"}
        </button>
      </form>
    </FormProvider>
  );
}
