/** @jsxImportSource @emotion/react */
import { useTheme } from '@emotion/react';
import { Stack } from 'next-ui';
import {
  forwardRef,
  InputHTMLAttributes,
  MutableRefObject,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { MdFileUpload } from 'react-icons/md';
import { ObjectConjunction } from 'shared-utils';

export type FileUploadAreaProps = ObjectConjunction<
  InputHTMLAttributes<HTMLInputElement>,
  { accept?: string; onFileSelect?: (files: FileList | null) => any }
>;

export type FileUploadAreaRef = {
  shell: MutableRefObject<HTMLDivElement | null>;
  input: MutableRefObject<HTMLInputElement | null>;
};

export const FileUploadArea = forwardRef<
  FileUploadAreaRef,
  FileUploadAreaProps
>(function FileUploadAreaRenderer(props, ref) {
  const theme = useTheme();
  const { onFileSelect, ...rest } = props;
  const [fileList, setFileList] = useState<FileList | null>(null);
  const shell = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  useImperativeHandle(ref, () => ({ shell, input }), []);
  return (
    <>
      <input
        id={id}
        ref={input}
        type={'file'}
        hidden
        onChange={(e) => {
          setFileList(e.target.files);
          onFileSelect?.(e.target.files);
        }}
        {...rest}
      />
      <label htmlFor={id}>
        <Stack
          direction={'row'}
          vAlign
          spacing={'xl'}
          sd={{
            paddingH: 'xl',
            paddingV: 'lg',
            roundness: 'md',
            border: `2px dashed ${
              props.disabled
                ? theme.sys.color.state.disabled
                : theme.sys.color.scheme.outline
            }`,
            userSelect: 'none',
            cursor: props.disabled ? 'default' : 'pointer',
            background: (t) =>
              props.disabled
                ? t.sys.color.state.disabled
                : t.sys.color.scheme.surfaceVariant,
            color: (t) =>
              props.disabled
                ? t.sys.color.state.disabled
                : t.sys.color.scheme.onSurfaceVariant,
          }}
        >
          <MdFileUpload size={21} />
          <span>Dateien auswählen</span>
        </Stack>
      </label>
    </>
  );
});

export default FileUploadArea;
