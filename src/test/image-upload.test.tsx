import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
vi.mock('@tanstack/react-start', () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock('@/lib/r2-upload.functions', () => ({ uploadImageToR2: vi.fn() }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));
import { ImageUpload } from '@/components/admin/ImageUpload';

describe('banner image URL entry', () => {
  it('does not load partial typed URLs and applies the complete URL explicitly', () => {
    const onChange = vi.fn();
    render(<ImageUpload value="" onChange={onChange} />);
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'URL' }), { button: 0, ctrlKey: false });
    fireEvent.focus(screen.getByRole('tab', { name: 'URL' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Image URL' }), { target: { value: 'https://app.upflare.com/templates/upflare/img/affiliate/upflare-wide.png' } });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Apply URL' }));
    expect(onChange).toHaveBeenCalledWith('https://app.upflare.com/templates/upflare/img/affiliate/upflare-wide.png');
  });
  it('keeps a failed image URL editable instead of deleting it', () => {
    const onChange = vi.fn();
    render(<ImageUpload value="https://affiliate.example/missing.png" onChange={onChange} />);
    fireEvent.error(screen.getByRole('img', { name: 'Preview' }));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'URL' }), { button: 0, ctrlKey: false });
    fireEvent.focus(screen.getByRole('tab', { name: 'URL' }));
    expect(screen.getByRole('textbox', { name: 'Image URL' })).toHaveValue('https://affiliate.example/missing.png');
  });
});