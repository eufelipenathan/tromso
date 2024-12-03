import os
import re
import json
import shutil
from typing import Set, Dict, List, Optional, Tuple
from pathlib import Path
from datetime import datetime

class NextJsAnalyzer:
    def __init__(self):
        self.project_root = self.find_project_root()
        if not self.project_root:
            raise ValueError("Não foi possível encontrar o package.json. Certifique-se de estar em um projeto Next.js válido.")
            
        self.used_files: Set[Path] = set()
        self.import_pattern = re.compile(r'(?:import|from|require)\s+[\'"]([^\'"]*)(?:[\'"])')
        self.dynamic_import_pattern = re.compile(r'(?:import|require)\([\'"]([^\'"]*?)[\'"]\)')
        self.export_pattern = re.compile(r'export\s+.*\s+from\s+[\'"]([^\'"]*)(?:[\'"])')
        self.next_special_files = {'page', 'layout', 'loading', 'error', 'not-found', 'route', 'template'}
        self.next_special_folders = {'app', 'pages', 'public', 'styles'}
        self.obsolete_dir = self.project_root / 'obsoletos'
        self.ignored_files_path = self.project_root / '.nextjs-analyzer-ignored.txt'
        self.aliases = self.load_aliases()
        self.dependency_graph: Dict[Path, Set[Path]] = {}
        self.reverse_dependency_graph: Dict[Path, Set[Path]] = {}
        self.ignored_files: Set[str] = self.load_ignored_files()

    def load_ignored_files(self) -> Set[str]:
        """Carrega a lista de arquivos ignorados pelo usuário"""
        if self.ignored_files_path.exists():
            try:
                with open(self.ignored_files_path, 'r', encoding='utf-8') as f:
                    return set(line.strip() for line in f if line.strip())
            except Exception:
                return set()
        return set()

    def save_ignored_file(self, file_path: str):
        """Salva um arquivo na lista de ignorados"""
        try:
            with open(self.ignored_files_path, 'a', encoding='utf-8') as f:
                f.write(f"{file_path}\n")
            self.ignored_files.add(file_path)
        except Exception as e:
            print(f"⚠️  Erro ao salvar arquivo ignorado: {str(e)}")

    def load_aliases(self) -> Dict[str, str]:
        """Carrega os aliases do tsconfig.json ou jsconfig.json"""
        config_files = ['tsconfig.json', 'jsconfig.json']
        for config_file in config_files:
            config_path = self.project_root / config_file
            if config_path.exists():
                try:
                    with open(config_path, 'r', encoding='utf-8') as f:
                        config = json.load(f)
                        paths = config.get('compilerOptions', {}).get('paths', {})
                        return {k.rstrip('/*'): v[0].rstrip('/*') for k, v in paths.items()}
                except (json.JSONDecodeError, IOError):
                    continue
        return {'@/*': '.'}

    def find_project_root(self) -> Optional[Path]:
        """Procura o package.json recursivamente até encontrar"""
        current = Path.cwd()
        while current != current.parent:
            if (current / 'package.json').exists():
                return current
            current = current.parent
        return None

    def is_next_special_file(self, file_path: Path) -> bool:
        """Verifica se o arquivo é especial do Next.js."""
        if any(part in self.next_special_folders for part in file_path.parts):
            return True
        
        stem = file_path.stem
        return any(special in stem for special in self.next_special_files)

    def get_all_project_files(self) -> Set[Path]:
        """Obtém todos os arquivos relevantes do projeto."""
        all_files = set()
        exclude_dirs = {'.git', 'node_modules', '.next', 'out', 'build', 'obsoletos', '.bolt'}
        
        try:
            for root, dirs, files in os.walk(self.project_root):
                dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith('.')]
                
                for file in files:
                    if file.endswith(('.ts', '.tsx', '.js', '.jsx', '.css', '.scss')):
                        file_path = Path(root) / file
                        try:
                            relative_path = file_path.relative_to(self.project_root)
                            if str(relative_path) not in self.ignored_files:
                                all_files.add(relative_path)
                        except ValueError:
                            continue
        except Exception as e:
            print(f"⚠️  Aviso ao escanear arquivos: {str(e)}")
        
        return all_files

    def resolve_import_path(self, import_path: str, current_file: Path) -> Optional[Path]:
        """Resolve o caminho de importação para um caminho de arquivo real."""
        if import_path.startswith('.'):
            # Importação relativa
            resolved = (current_file.parent / import_path).resolve()
        else:
            # Verifica aliases
            for alias, alias_path in self.aliases.items():
                if import_path.startswith(alias):
                    import_path = import_path.replace(alias, alias_path)
                    break
            resolved = (self.project_root / import_path).resolve()

        # Adiciona extensões comuns se necessário
        if not resolved.suffix:
            for ext in ['.ts', '.tsx', '.js', '.jsx']:
                if (resolved.with_suffix(ext)).exists():
                    return resolved.with_suffix(ext)
                # Verifica index files
                index_file = resolved / f'index{ext}'
                if index_file.exists():
                    return index_file
        return resolved if resolved.exists() else None

    def analyze_file_imports(self, file_path: Path) -> Set[Path]:
        """Analisa as importações de um arquivo."""
        imports = set()
        try:
            with open(self.project_root / file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Encontra todas as importações
            all_imports = set()
            all_imports.update(self.import_pattern.findall(content))
            all_imports.update(self.dynamic_import_pattern.findall(content))
            all_imports.update(self.export_pattern.findall(content))
            
            for import_path in all_imports:
                if import_path.startswith('.') or any(import_path.startswith(alias) for alias in self.aliases):
                    resolved = self.resolve_import_path(import_path, file_path)
                    if resolved:
                        try:
                            relative = resolved.relative_to(self.project_root)
                            imports.add(relative)
                        except ValueError:
                            continue
                            
        except Exception as e:
            print(f"⚠️  Erro ao analisar {file_path}: {str(e)}")
            
        return imports

    def build_dependency_graph(self):
        """Constrói o grafo de dependências."""
        all_files = self.get_all_project_files()
        
        for file in all_files:
            self.dependency_graph[file] = self.analyze_file_imports(file)
            
            # Constrói o grafo reverso
            for imported in self.dependency_graph[file]:
                if imported not in self.reverse_dependency_graph:
                    self.reverse_dependency_graph[imported] = set()
                self.reverse_dependency_graph[imported].add(file)

    def find_used_files(self):
        """Encontra todos os arquivos utilizados começando dos pontos de entrada."""
        entry_points = {
            file for file in self.dependency_graph.keys()
            if self.is_next_special_file(file)
        }
        
        to_visit = entry_points.copy()
        visited = set()
        
        while to_visit:
            current = to_visit.pop()
            if current in visited:
                continue
                
            visited.add(current)
            self.used_files.add(current)
            
            # Adiciona dependências diretas
            if current in self.dependency_graph:
                for dep in self.dependency_graph[current]:
                    if dep not in visited:
                        to_visit.add(dep)

    def get_obsolete_reason(self, file: Path) -> str:
        """Determina a razão pela qual um arquivo é considerado obsoleto."""
        if file in self.reverse_dependency_graph:
            importers = self.reverse_dependency_graph[file]
            if not importers:
                return "Arquivo não é importado por nenhum outro arquivo"
            elif not any(importer in self.used_files for importer in importers):
                return "Arquivo é importado apenas por outros arquivos obsoletos"
        else:
            return "Arquivo não é importado por nenhum outro arquivo e não é um ponto de entrada"
        
        return "Arquivo não alcançável a partir dos pontos de entrada da aplicação"

    def move_to_obsolete(self, file_path: Path) -> bool:
        """Move um arquivo para a pasta de obsoletos."""
        try:
            source = self.project_root / file_path
            target = self.obsolete_dir / file_path
            
            # Cria diretórios necessários
            target.parent.mkdir(parents=True, exist_ok=True)
            
            # Se o arquivo já existe, adiciona timestamp
            if target.exists():
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                target = target.with_name(f"{target.stem}_{timestamp}{target.suffix}")
            
            # Copia o arquivo para o destino
            shutil.copy2(source, target)
            
            # Remove o arquivo original
            source.unlink()
            
            return True
        except Exception as e:
            print(f"⚠️  Erro ao mover {file_path}: {str(e)}")
            return False

    def find_empty_folders(self) -> List[Path]:
        """Encontra pastas vazias após a movimentação dos arquivos."""
        empty_folders = []
        exclude_dirs = {'.git', 'node_modules', '.next', 'out', 'build', 'obsoletos'}
        
        for root, dirs, files in os.walk(self.project_root, topdown=False):
            dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith('.')]
            
            if not files and not dirs:
                try:
                    path = Path(root).relative_to(self.project_root)
                    if str(path) != '.':  # Ignora a raiz do projeto
                        empty_folders.append(path)
                except ValueError:
                    continue
                    
        return empty_folders

    def analyze_files(self) -> Dict[Path, str]:
        """Analisa todos os arquivos e retorna os obsoletos com suas razões."""
        self.build_dependency_graph()
        self.find_used_files()
        
        all_files = self.get_all_project_files()
        obsolete_files = {}
        
        for file in all_files:
            if file not in self.used_files:
                reason = self.get_obsolete_reason(file)
                obsolete_files[file] = reason
                
        return obsolete_files

def main():
    try:
        print("\n🔍 Analisando arquivos...")
        analyzer = NextJsAnalyzer()
        obsolete_files = analyzer.analyze_files()
        
        if not obsolete_files:
            print("\n✨ Nenhum arquivo obsoleto encontrado!")
            return

        print("\n📄 Arquivos Obsoletos Encontrados:")
        obsolete_list = sorted(obsolete_files.items())
        
        # Pergunta ao usuário como deseja proceder
        print("\nComo você deseja proceder?")
        print("1. Analisar e mover arquivos um por um")
        print("2. Mover todos os arquivos de uma vez")
        choice = input("\nEscolha uma opção (1 ou 2): ").strip()

        if choice == "1":
            # Análise individual
            for file, reason in obsolete_list:
                try:
                    print(f"\nfile://{os.path.abspath(analyzer.project_root / file)}")
                    print(f"Motivo: {reason}")
                    response = input("\nDeseja mover este arquivo? (S/N/I - S para sim, N para não, I para ignorar sempre): ").strip().lower()
                    
                    if response == 's':
                        if analyzer.move_to_obsolete(file):
                            print("✅ Arquivo movido com sucesso!")
                    elif response == 'i':
                        analyzer.save_ignored_file(str(file))
                        print("✅ Arquivo adicionado à lista de ignorados!")
                except Exception:
                    print(f"\n{file}")
                    print(f"Motivo: {reason}")
        else:
            # Movimento em massa
            print("\n📦 Movendo todos os arquivos...")
            for file in obsolete_files:
                if analyzer.move_to_obsolete(file):
                    print(f"✅ Movido: {file}")

        # Verifica pastas vazias
        empty_folders = analyzer.find_empty_folders()
        if empty_folders:
            print("\n📁 Pastas Vazias Encontradas:")
            for folder in empty_folders:
                print(f"\nfile://{os.path.abspath(analyzer.project_root / folder)}")
            
            response = input("\n❓ Deseja mover as pastas vazias para 'obsoletos'? (S/N): ").strip().lower()
            if response == 's':
                print("\n📦 Movendo pastas vazias...")
                for folder in empty_folders:
                    target = analyzer.obsolete_dir / folder
                    target.mkdir(parents=True, exist_ok=True)
                    source = analyzer.project_root / folder
                    try:
                        if source.exists():
                            source.rmdir()
                            print(f"✅ Pasta removida: {folder}")
                    except Exception as e:
                        print(f"⚠️  Erro ao remover pasta {folder}: {str(e)}")
        
        print("\n✨ Processo concluído!")
        print(f"📂 Os itens foram movidos para: {analyzer.obsolete_dir}")
                
    except Exception as e:
        print(f"\n❌ Erro inesperado: {str(e)}")

if __name__ == "__main__":
    main()