# Pwn

二进制漏洞利用方向：内存破坏、ROP 与堆利用。

## 常见考点

- 栈溢出与 ret2text / ret2libc
- 格式化字符串漏洞
- ROP 链构造
- 堆利用（fastbin、tcache 等）
- 整数溢出、use-after-free

## 常用工具

- pwntools、gdb + pwndbg
- Ghidra、IDA Pro
- checksec、ROPgadget、one_gadget
