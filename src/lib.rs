use zed_extension_api::{self as zed, Command, LanguageServerId, Result, Worktree};
use zed::serde_json;

const SDK_PATH: &str = r#"G:\Work\DevTools\SDK\cj\cangjie-sdk-windows-x64-1.1.3\cangjie"#;

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
        let server_path = format!(r#"{}\tools\bin\LSPServer.exe"#, SDK_PATH);

        let mut env = worktree.shell_env();

        env.push(("CANGJIE_HOME".to_string(), SDK_PATH.to_string()));

        let cangjie_paths = vec![
            format!(r#"{}\runtime\lib\windows_x86_64_cjnative"#, SDK_PATH),
            format!(r#"{}\lib\windows_x86_64_cjnative"#, SDK_PATH),
            format!(r#"{}\bin"#, SDK_PATH),
            format!(r#"{}\tools\bin"#, SDK_PATH),
            format!(r#"{}\tools\lib"#, SDK_PATH),
        ];
        let cangjie_prefix = cangjie_paths.join(";");

        let mut new_path = cangjie_prefix.clone();
        for (key, val) in &env {
            if key == "PATH" {
                new_path.push(';');
                new_path.push_str(val);
                break;
            }
        }
        env.push(("PATH".to_string(), new_path));

        let server_args = vec!["src".to_string(), "--disableAutoImport".to_string()];

        Ok(Command {
            command: server_path,
            args: server_args,
            env,
        })
    }

    fn language_server_initialization_options(
        &mut self,
        _language_server_id: &LanguageServerId,
        _worktree: &Worktree,
    ) -> Result<Option<serde_json::Value>> {
        Ok(Some(serde_json::json!({
            "multiModuleOption": {},
            "conditionCompileOption": {},
            "singleConditionCompileOption": {},
            "conditionCompilePaths": [],
            "targetLib": ""
        })))
    }
}

zed::register_extension!(CangjieExtension);
