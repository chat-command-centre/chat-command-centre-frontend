import yaml
import ell
import sys
import os

# Initialize ell with verbose mode for detailed outputs
ell.init(verbose=True)


# Load integrations from a YAML file
def load_integrations_from_yaml(file_path):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"YAML file not found: {file_path}")
    with open(file_path, "r", encoding="utf-8") as file:
        return yaml.safe_load(file)


@ell.simple(model="gpt-4")
def generate_integration_description(integration_name):
    """You are an expert in email integration systems. Provide a brief description of the given email service integration."""
    return f"Generate a brief description for the {integration_name} integration."


@ell.simple(model="gpt-4")
def generate_tool_description(integration_name, tool_name, tool_args):
    """You are an expert in email integration systems. Provide a brief description of the given tool for an email service integration."""
    args_description = ", ".join(
        [f"{arg['name']} ({arg['description']})" for arg in tool_args]
    )
    return f"Generate a brief description for the '{tool_name}' tool of the {integration_name} integration. The tool has the following arguments: {args_description}"


def populate_integration_details(integrations):
    for integration in integrations:
        integration_name = integration.get("name", "Unknown Integration")

        # Generate integration description
        integration["description"] = generate_integration_description(integration_name)

        tools = integration.get("tools", [])
        for tool in tools:
            tool_name = tool.get("name", "Unknown Tool")
            tool_args = tool.get(
                "arg_schena", []
            )  # Note: using 'arg_schena' as in the original YAML

            # Generate tool description
            tool["description"] = generate_tool_description(
                integration_name, tool_name, tool_args
            )

            # Correct the key name
            if "arg_schena" in tool:
                tool["arg_schema"] = tool.pop("arg_schena")

        print(f"Generated descriptions for {integration_name}")

    return integrations


# Add this custom YAML representer for _lstr objects
def lstr_representer(dumper, data):
    return dumper.represent_scalar("tag:yaml.org,2002:str", str(data))


yaml.add_representer(ell.types._lstr._lstr, lstr_representer)


# Save the updated integrations back to a YAML file or display them
def save_or_display_integrations(integrations, output_path=None):
    if output_path:
        with open(output_path, "w", encoding="utf-8") as file:
            yaml.dump(integrations, file, default_flow_style=False, sort_keys=False)
        print(f"Updated integrations saved to {output_path}")
    else:
        print(yaml.dump(integrations, default_flow_style=False, sort_keys=False))


# Main function to load, process, and optionally save the updated integrations
def main(yaml_input_path, yaml_output_path=None):
    integrations = load_integrations_from_yaml(yaml_input_path)
    updated_integrations = populate_integration_details(integrations)
    save_or_display_integrations(updated_integrations, yaml_output_path)


# Entry point
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python script_name.py <input_yaml> [output_yaml]")
        sys.exit(1)

    input_yaml_path = sys.argv[1]
    output_yaml_path = sys.argv[2] if len(sys.argv) > 2 else None

    main(input_yaml_path, output_yaml_path)
