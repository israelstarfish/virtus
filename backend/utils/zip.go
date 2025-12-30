//utils/zip.go

package utils

import (
	"archive/zip"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

// 📦 Extrai arquivos de um .zip para o diretório de destino com segurança
func ExtractZip(src, dest string) error {
	r, err := zip.OpenReader(src)
	if err != nil {
		return err
	}
	defer r.Close()

	err = os.MkdirAll(dest, 0755)
	if err != nil {
		return fmt.Errorf("erro ao criar diretório de destino: %w", err)
	}

	for _, f := range r.File {
		outPath := filepath.Join(dest, f.Name)

		// 🛡️ Protege contra caminhos maliciosos
		if !strings.HasPrefix(outPath, filepath.Clean(dest)+string(os.PathSeparator)) {
			return fmt.Errorf("arquivo fora do diretório de destino: %s", outPath)
		}

		if f.FileInfo().IsDir() {
			err := os.MkdirAll(outPath, f.Mode())
			if err != nil {
				return fmt.Errorf("erro ao criar diretório: %w", err)
			}
			continue
		}

		rc, err := f.Open()
		if err != nil {
			return fmt.Errorf("erro ao abrir arquivo zip interno: %w", err)
		}

		outFile, err := os.OpenFile(outPath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
		if err != nil {
			rc.Close()
			return fmt.Errorf("erro ao criar arquivo extraído: %w", err)
		}

		_, err = io.Copy(outFile, rc)
		rc.Close()
		outFile.Close()

		if err != nil {
			return fmt.Errorf("erro ao copiar conteúdo: %w", err)
		}
	}

	return nil
}

// 📦 Compacta um diretório em um arquivo .zip
func ZipFolder(sourceDir, zipPath string) error {
	zipFile, err := os.Create(zipPath)
	if err != nil {
		return fmt.Errorf("erro ao criar arquivo zip: %w", err)
	}
	defer zipFile.Close()

	archive := zip.NewWriter(zipFile)
	defer archive.Close()

	baseDir := filepath.Clean(sourceDir)

	err = filepath.Walk(baseDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// ❌ Ignora symlinks
		if info.Mode()&os.ModeSymlink != 0 {
			return nil
		}

		relPath := strings.TrimPrefix(path, baseDir)
		relPath = strings.TrimPrefix(relPath, string(filepath.Separator))
		if relPath == "" {
			return nil
		}

		header, err := zip.FileInfoHeader(info)
		if err != nil {
			return err
		}
		header.Name = relPath

		if info.IsDir() {
			header.Name += "/"
			_, err = archive.CreateHeader(header)
			return err
		}

		header.Method = zip.Deflate
		writer, err := archive.CreateHeader(header)
		if err != nil {
			return err
		}

		file, err := os.Open(path)
		if err != nil {
			return err
		}
		defer file.Close()

		_, err = io.Copy(writer, file)
		return err
	})

	if err != nil {
		return fmt.Errorf("erro ao compactar pasta: %w", err)
	}

	return nil
}

//func ZipFolder(sourceDir, zipPath string) error {
//	zipFile, err := os.Create(zipPath)
//	if err != nil {
//		return fmt.Errorf("erro ao criar arquivo zip: %w", err)
//	}
//	defer zipFile.Close()
//
//	archive := zip.NewWriter(zipFile)
//	defer archive.Close()
//
//	baseDir := filepath.Clean(sourceDir)
//
//	err = filepath.Walk(baseDir, func(path string, info os.FileInfo, err error) error {
//		if err != nil {
//			return err
//		}
//
//		relPath := strings.TrimPrefix(path, baseDir)
//		relPath = strings.TrimPrefix(relPath, string(filepath.Separator))
//		if relPath == "" {
//			return nil
//		}
//
//		header, err := zip.FileInfoHeader(info)
//		if err != nil {
//			return err
//		}
//		header.Name = relPath
//
//		if info.IsDir() {
//			header.Name += "/"
//			_, err = archive.CreateHeader(header)
//			return err // ✅ Cria entrada de diretório e encerra
//		}
//
//		header.Method = zip.Deflate
//		writer, err := archive.CreateHeader(header)
//		if err != nil {
//			return err
//		}
//
//		file, err := os.Open(path)
//		if err != nil {
//			return err
//		}
//		defer file.Close()
//
//		_, err = io.Copy(writer, file)
//		return err
//	})
//
//	if err != nil {
//		return fmt.Errorf("erro ao compactar pasta: %w", err)
//	}
//
//	return nil
//}

//func ZipFolder(sourceDir, zipPath string) error {
//	zipFile, err := os.Create(zipPath)
//	if err != nil {
//		return err
//	}
//	defer zipFile.Close()
//
//	archive := zip.NewWriter(zipFile)
//	defer archive.Close()
//
//	baseDir := filepath.Clean(sourceDir)
//
//	err = filepath.Walk(baseDir, func(path string, info os.FileInfo, err error) error {
//		if err != nil {
//			return err
//		}
//
//		relPath := strings.TrimPrefix(path, baseDir)
//		relPath = strings.TrimPrefix(relPath, string(filepath.Separator))
//		if relPath == "" {
//			return nil
//		}
//
//		header, err := zip.FileInfoHeader(info)
//		if err != nil {
//			return err
//		}
//		header.Name = relPath
//
//		if info.IsDir() {
//			header.Name += "/"
//		} else {
//			header.Method = zip.Deflate
//		}
//
//		writer, err := archive.CreateHeader(header)
//		if err != nil {
//			return err
//		}
//
//		if !info.IsDir() {
//			file, err := os.Open(path)
//			if err != nil {
//				return err
//			}
//			defer file.Close()
//			_, err = io.Copy(writer, file)
//			if err != nil {
//				return err
//			}
//		}
//
//		return nil
//	})
//
//	return err
//}

//func ZipFolder(sourceDir, zipPath string) error {
//	zipFile, err := os.Create(zipPath)
//	if err != nil {
//		return fmt.Errorf("erro ao criar arquivo zip: %w", err)
//	}
//	defer zipFile.Close()
//
//	archive := zip.NewWriter(zipFile)
//	defer archive.Close()
//
//	baseDir := filepath.Clean(sourceDir)
//
//	err = filepath.Walk(baseDir, func(path string, info os.FileInfo, err error) error {
//		if err != nil {
//			return err
//		}
//
//		// Caminho relativo dentro do zip
//		relPath := strings.TrimPrefix(path, baseDir)
//		relPath = strings.TrimPrefix(relPath, string(filepath.Separator))
//		if relPath == "" {
//			return nil // ignora raiz
//		}
//
//		header, err := zip.FileInfoHeader(info)
//		if err != nil {
//			return err
//		}
//		header.Name = relPath
//
//		if info.IsDir() {
//			header.Name += "/"
//		} else {
//			header.Method = zip.Deflate
//		}
//
//		writer, err := archive.CreateHeader(header)
//		if err != nil {
//			return err
//		}
//
//		if !info.IsDir() {
//			file, err := os.Open(path)
//			if err != nil {
//				return err
//			}
//			defer file.Close()
//			_, err = io.Copy(writer, file)
//			if err != nil {
//				return err
//			}
//		}
//
//		return nil
//	})
//
//	if err != nil {
//		return fmt.Errorf("erro ao compactar pasta: %w", err)
//	}
//
//	return nil
//}

//package utils
//
//import (
//	"archive/zip"
//	"io"
//	"os"
//	"path/filepath"
//)
//
//func ExtractZip(src, dest string) error {
//	r, err := zip.OpenReader(src)
//	if err != nil {
//		return err
//	}
//	defer r.Close()
//
//	os.MkdirAll(dest, 0755)
//
//	for _, f := range r.File {
//		outPath := filepath.Join(dest, f.Name)
//		if f.FileInfo().IsDir() {
//			os.MkdirAll(outPath, f.Mode())
//			continue
//		}
//
//		rc, err := f.Open()
//		if err != nil {
//			return err
//		}
//		defer rc.Close()
//
//		outFile, err := os.OpenFile(outPath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
//		if err != nil {
//			return err
//		}
//		defer outFile.Close()
//
//		_, err = io.Copy(outFile, rc)
//		if err != nil {
//			return err
//		}
//	}
//
//	return nil
//}
