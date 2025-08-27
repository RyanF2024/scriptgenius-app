import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileUpload } from '@/components/ui/FileUpload';
import { act } from 'react-dom/test-utils';

// Mock the File and FileReader APIs
class MockFileReader {
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  result: string | ArrayBuffer | null = null;
  error: DOMException | null = null;
  
  readAsDataURL() {
    this.result = 'data:image/png;base64,mock';
    if (this.onload) {
      this.onload(new ProgressEvent('load'));
    }
  }
  
  // Add other required methods
  onerror() {}
  onloadend() {}
  readAsArrayBuffer() {}
  readAsBinaryString() {}
  readAsText() {}
  abort() {}
  DONE = 2;
  EMPTY = 0;
  LOADING = 1;
}

global.FileReader = MockFileReader as any;

describe('FileUpload', () => {
  const mockOnUpload = jest.fn();
  
  const createFile = (name: string, size: number, type: string) => {
    const file = new File(['test'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the upload area', () => {
    render(<FileUpload onUpload={mockOnUpload} />);
    
    expect(screen.getByText('Click to upload')).toBeInTheDocument();
    expect(screen.getByText('or drag and drop')).toBeInTheDocument();
    expect(screen.getByText('Choose files')).toBeInTheDocument();
  });

  it('accepts file input', async () => {
    const file = createFile('test.png', 1024, 'image/png');
    
    render(<FileUpload onUpload={mockOnUpload} />);
    
    const input = screen.getByLabelText('file-upload') as HTMLInputElement;
    
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    
    expect(screen.getByText('test.png')).toBeInTheDocument();
    expect(screen.getByText('1 KB')).toBeInTheDocument();
  });

  it('shows error for invalid file type', async () => {
    const file = createFile('test.exe', 1024, 'application/exe');
    
    render(
      <FileUpload 
        onUpload={mockOnUpload} 
        accept="image/*"
      />
    );
    
    const input = screen.getByLabelText('file-upload') as HTMLInputElement;
    
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    
    expect(screen.getByText(/file type not allowed/i)).toBeInTheDocument();
  });

  it('shows error for file size limit', async () => {
    const file = createFile('test.png', 6 * 1024 * 1024, 'image/png');
    
    render(
      <FileUpload 
        onUpload={mockOnUpload} 
        maxSize={5 * 1024 * 1024} // 5MB
      />
    );
    
    const input = screen.getByLabelText('file-upload') as HTMLInputElement;
    
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    
    expect(screen.getByText(/file is too large/i)).toBeInTheDocument();
  });

  it('handles drag and drop', async () => {
    const file = createFile('test.png', 1024, 'image/png');
    
    render(<FileUpload onUpload={mockOnUpload} />);
    
    const dropzone = screen.getByText('Click to upload').parentElement!;
    
    await act(async () => {
      fireEvent.dragOver(dropzone);
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [file],
          types: ['Files'],
          clearData: () => {},
        },
      });
    });
    
    expect(screen.getByText('test.png')).toBeInTheDocument();
  });

  it('uploads files when upload button is clicked', async () => {
    const file = createFile('test.png', 1024, 'image/png');
    
    render(<FileUpload onUpload={mockOnUpload} />);
    
    const input = screen.getByLabelText('file-upload') as HTMLInputElement;
    
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Upload 1 file(s)'));
    });
    
    // Wait for upload to complete
    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith([expect.any(File)]);
    });
  });

  it('shows upload progress', async () => {
    const file = createFile('test.png', 1024, 'image/png');
    
    render(<FileUpload onUpload={mockOnUpload} />);
    
    const input = screen.getByLabelText('file-upload') as HTMLInputElement;
    
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
      fireEvent.click(screen.getByText('Upload 1 file(s)'));
    });
    
    // Check if progress is shown
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Wait for upload to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('allows removing files', async () => {
    const file = createFile('test.png', 1024, 'image/png');
    
    render(<FileUpload onUpload={mockOnUpload} />);
    
    const input = screen.getByLabelText('file-upload') as HTMLInputElement;
    
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    
    expect(screen.getByText('test.png')).toBeInTheDocument();
    
    const removeButton = screen.getByLabelText('Remove file');
    await act(async () => {
      fireEvent.click(removeButton);
    });
    
    expect(screen.queryByText('test.png')).not.toBeInTheDocument();
  });

  it('respects maxFiles limit', async () => {
    const files = [
      createFile('test1.png', 1024, 'image/png'),
      createFile('test2.png', 1024, 'image/png'),
    ];
    
    render(
      <FileUpload 
        onUpload={mockOnUpload} 
        maxFiles={1}
      />
    );
    
    const input = screen.getByLabelText('file-upload') as HTMLInputElement;
    
    await act(async () => {
      fireEvent.change(input, { target: { files } });
    });
    
    expect(screen.getByText(/you can only upload up to 1 file/i)).toBeInTheDocument();
  });
});
