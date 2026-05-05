from PySide6.QtWidgets import QApplication

from smart_doc_analyzer.config.fonts import configure_application_fonts
from smart_doc_analyzer.ui.main_window import MainWindow


def main() -> int:
    app = QApplication.instance() or QApplication([])
    configure_application_fonts(app)
    window = MainWindow()
    window.show()
    return app.exec()
