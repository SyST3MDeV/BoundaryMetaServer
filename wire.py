def decode_protobuf_key(byte):
    """
    Decode a protobuf key byte into field number and wire type.
    
    Args:
        byte: A single byte (int 0-255)
    
    Returns:
        tuple: (field_number, wire_type)
    """
    wire_type = byte & 0x07  # Last 3 bits
    field_number = byte >> 3  # Remaining bits
    
    return field_number, wire_type


def wire_type_name(wire_type):
    """Get the human-readable name for a wire type."""
    names = {
        0: "Varint",
        1: "64-bit",
        2: "Length-delimited",
        3: "Start group (deprecated)",
        4: "End group (deprecated)",
        5: "32-bit"
    }
    return names.get(wire_type, "Unknown")


# Examples
if __name__ == "__main__":
    # Test with the examples from my previous response
    test_bytes = [0x0a, 0x10, 0x08, 0x19]
    
    for byte in test_bytes:
        field_num, wire_type = decode_protobuf_key(byte)
        print(f"Byte: 0x{byte:02x} ({byte:3d}) -> "
              f"Field #{field_num}, Wire Type {wire_type} ({wire_type_name(wire_type)})")
    
    print("\n" + "="*60 + "\n")
    
    # Interactive mode
    print("Enter a byte value (0-255) to decode, or 'q' to quit:")
    while True:
        user_input = input("> ").strip()
        if user_input.lower() == 'q':
            break
        
        try:
            byte_val = int(user_input, 0)  # Supports hex (0x..) and decimal
            if 0 <= byte_val <= 255:
                field_num, wire_type = decode_protobuf_key(byte_val)
                print(f"  Field #{field_num}, Wire Type {wire_type} ({wire_type_name(wire_type)})")
            else:
                print("  Error: Value must be between 0 and 255")
        except ValueError:
            print("  Error: Invalid input")