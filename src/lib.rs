use zed::serde_json;
use zed_extension_api::{self as zed, Command, LanguageServerId, Result, Worktree};

const SDK_PATH: &str = r#"G:\Work\DevTools\SDK\cj\cangjie-sdk-windows-x64-1.2.0-alpha\cangjie"#;

struct CangjieExtension;

impl CangjieExtension {
    fn file_uri(path: &str) -> String {
        let normalized = path.replace('\\', "/");
        if normalized.starts_with("/") {
            format!("file://{}", normalized)
        } else {
            format!("file:///{}", normalized)
        }
    }
}

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

        // Inherit CANGJIE_STDX_PATH from worktree shell env if set
        let mut has_stdx = false;
        for (k, v) in &env {
            if k == "CANGJIE_STDX_PATH" {
                has_stdx = true;
                break;
            }
        }
        if !has_stdx {
            // Set a default path if not already set
            let stdx_path = format!(r#"{}\..\..\windows_x86_64_cjnative\static\stdx"#, SDK_PATH);
            env.push(("CANGJIE_STDX_PATH".to_string(), stdx_path));
        }

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

        Ok(Command {
            command: server_path,
            args: vec!["src".to_string(), "--disableAutoImport".to_string()],
            env,
        })
    }

    fn language_server_initialization_options(
        &mut self,
        _language_server_id: &LanguageServerId,
        worktree: &Worktree,
    ) -> Result<Option<serde_json::Value>> {
        let root = worktree.root_path();
        let root_uri = Self::file_uri(&root);

        // Try to find cjpm.toml in root or subdirectories
        let cjpm_paths = ["cjpm.toml", "gamecrit-server/cjpm.toml"];
        let (package_name, project_subdir) = {
            let mut name = String::new();
            let mut subdir = String::new();
            for path in &cjpm_paths {
                if let Ok(content) = worktree.read_text_file(path) {
                    let mut in_pkg = false;
                    for line in content.lines() {
                        let t = line.trim();
                        if t == "[package]" { in_pkg = true; continue; }
                        if in_pkg && t.starts_with("name = ") {
                            name = t.strip_prefix("name = ").unwrap().trim_matches('"').to_string();
                            if let Some(idx) = path.rfind('/') {
                                subdir = path[..idx].to_string();
                            }
                            break;
                        }
                    }
                    if !name.is_empty() { break; }
                }
            }
            (name, subdir)
        };

        let project_root = if project_subdir.is_empty() {
            root.clone()
        } else {
            format!(r"{}\{}", root, project_subdir)
        };
        let project_uri = Self::file_uri(&project_root);

        let module_name = if package_name.is_empty() {
            std::path::Path::new(&project_root)
                .file_name()
                .map(|n| n.to_string_lossy().to_string())
                .unwrap_or_else(|| "unknown".to_string())
        } else {
            package_name
        };

        let module = serde_json::json!({
            "moduleNameKeyInModuleJson": module_name,
            "LSP_REQUIRES": {},
            "LSP_PACKAGE_REQUIRES": {},
            "LSP_PATH_OPTION": [],
            "LSP_PACKAGE_OPTION": [],
            "LSP_JAVA_REQUIRES": [],
            "LSP_C_REQUIRES": []
        });

        let mut multi_module = serde_json::Map::new();
        multi_module.insert(project_uri, module);

        Ok(Some(serde_json::json!({
            "multiModuleOption": multi_module,
            "conditionCompileOption": {},
            "singleConditionCompileOption": {},
            "conditionCompilePaths": [],
            "targetLib": "",
            "requirePath": "",
            "newRequirePath": ""
        })))
    }
}

zed::register_extension!(CangjieExtension);
