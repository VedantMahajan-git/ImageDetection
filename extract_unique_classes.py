import os

def extract_unique_class_ids(labels_dir):
    class_ids = set()
    for filename in os.listdir(labels_dir):
        if filename.endswith('.txt'):
            filepath = os.path.join(labels_dir, filename)
            with open(filepath, 'r') as file:
                for line in file:
                    parts = line.strip().split()
                    if parts:
                        try:
                            class_id = int(parts[0])
                            class_ids.add(class_id)
                        except ValueError:
                            continue
    return sorted(class_ids)

if __name__ == "__main__":
    train_labels_dir = 'C:/Manu-Dataset/yolov5/circuit_elements/train/labels/'
    val_labels_dir = 'C:/Manu-Dataset/yolov5/circuit_elements/valid/labels/'

    train_classes = extract_unique_class_ids(train_labels_dir)
    val_classes = extract_unique_class_ids(val_labels_dir)

    all_classes = sorted(set(train_classes).union(val_classes))
    print(f"Unique Class IDs in Dataset: {all_classes}")
