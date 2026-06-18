use zed_extension_api::{self as zed, Command, LanguageServerId, Result, Worktree};

struct CangjieExtension;

impl zed::Extension for CangjieExtension {
    fn new() -> Self {
        Self
    }

    fn language_server_command(
        &mut self,
        _language_server_id: &LanguageServerId,
        worktree: &Worktree,
    ) -> Result<Command> {
        // Try to find LSPServer in PATH first
        if let Some(path) = worktree.which("LSPServer") {
            return Ok(Command {
                command: path,
                args: vec![],
                env: vec![],
            });
        }

        // Fallback: common Cangjie SDK installation paths
        let possible_paths = vec![
            r#"G:\Work\DevTools\SDK\cj\cangjie\tools\bin\LSPServer.exe"#,
            r#"C:\Program Files\Cangjie\tools\bin\LSPServer.exe"#,
            r#"D:\Program Files\Zed\tools\bin\LSPServer.exe"#,
        ];

        for path in possible_paths {
            if std::path::Path::new(path).exists() {
                return Ok(Command {
                    command: path.to_string(),
                    args: vec![],
                    env: vec![],
                });
            }
        }

        Err("LSPServer not found. Please install the Cangjie SDK and ensure LSPServer.exe is in your PATH.".into())
    }
}

zed::register_extension!(CangjieExtension);
