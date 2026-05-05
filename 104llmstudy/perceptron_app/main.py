from PySide6.QtWidgets import QApplication

from perceptron_app.ui.main_window import MainWindow


def main() -> int:
    app = QApplication.instance() or QApplication([])
    app.setApplicationName("Perceptron Trainer")
    window = MainWindow()
    window.show()
    return app.exec()


if __name__ == "__main__":
    raise SystemExit(main())

