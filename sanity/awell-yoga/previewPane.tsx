import React from 'react';

type PreviewPaneOptions = {
  path?: string;
};

type PreviewPaneProps = {
  options?: PreviewPaneOptions;
};

const previewOrigin = process.env.SANITY_STUDIO_PREVIEW_ORIGIN || 'http://localhost:4200';

export function PreviewPane(props: PreviewPaneProps) {
  const path = props.options?.path || '/';
  const previewUrl = new URL(path, previewOrigin);
  previewUrl.searchParams.set('preview', 'true');
  const url = previewUrl.toString();

  return (
    <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          borderBottom: '1px solid #e6e6e6',
          fontSize: '0.9rem'
        }}
      >
        <span>
          Page preview: <strong>{path}</strong>
        </span>
        <a href={url} target="_blank" rel="noreferrer" style={{textDecoration: 'none'}}>
          Open full page
        </a>
      </div>
      <iframe
        title={`Preview ${path}`}
        src={url}
        style={{width: '100%', height: '100%', border: 'none'}}
      />
    </div>
  );
}
