use zed_extension_api::{self as zed, Command, LanguageServerId, Result, Worktree};

const SDK_PATH: &str = r#"G:\Work\DevTools\SDK\cj\cangjie"#;

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
        let server_path = if let Some(path) = worktree.which("LSPServer") {
            path
        } else {
            // Use known SDK installation path
            format!(r#"{}\tools\bin\LSPServer.exe"#, SDK_PATH)
        };

        let mut env = worktree.shell_env();
        env.push(format!("CANGJIE_HOME={}", SDK_PATH));

        let runtime_lib = format!(r#"{}\runtime\lib\windows_x86_64_cjnative"#, SDK_PATH);
        let tools_bin = format!(r#"{}\tools\bin"#, SDK_PATH);
        let tools_lib = format!(r#"{}\tools\lib"#, SDK_PATH);

        // Prepend Cangjie paths to existing PATH
        let mut new_path = format!("{};{};{}", runtime_lib, tools_bin, tools_lib);
        for entry in &env {
            if entry.starts_with("PATH=") {
                new_path.push(';');
                new_path.push_str(&entry[5..]);
                break;
            }
        }
        env.push(format!("PATH={}", new_path));

        Ok(Command {
            command: server_path,
            args: vec![],
            env,
        })
    }
}

zed::register_extension!(CangjieExtension);
