//backend/utils/code.go

package utils

import (
	"crypto/rand"
	"strings"
)

func GenerateCode(length int) string {
	const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	var b strings.Builder
	b.Grow(length)

	for i := 0; i < length; i++ {
		randomByte := make([]byte, 1)
		_, err := rand.Read(randomByte)
		if err != nil {
			// fallback para 'A' se falhar
			b.WriteByte('A')
			continue
		}
		index := int(randomByte[0]) % len(charset)
		b.WriteByte(charset[index])
	}

	return b.String()
}
