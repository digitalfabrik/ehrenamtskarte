import 'package:flutter/material.dart';
import 'package:carousel_slider/carousel_slider.dart';

class CardCarousel extends StatefulWidget {
  final List<Widget> cards;
  final int cardIndex;
  final Function(int index) updateIndex;
  final CarouselController carouselController;

  const CardCarousel(
      {super.key,
      required this.cards,
      required this.cardIndex,
      required this.updateIndex,
      required this.carouselController});

  @override
  CardCarouselState createState() => CardCarouselState();
}

// Default bottomNavigationBarHeight in flutter
// https://api.flutter.dev/flutter/material/NavigationBar/height.html
final double bottomNavigationBarHeight = 80;

class CardCarouselState extends State<CardCarousel> {
  @override
  Widget build(BuildContext context) {
    final double indicatorHeight = widget.cards.length > 1 ? 28 : 0;

    return Expanded(
      child: Column(
        children: [
          SingleChildScrollView(
            child: CarouselSlider(
              items: widget.cards,
              carouselController: widget.carouselController,
              options: CarouselOptions(
                  enableInfiniteScroll: false,
                  viewportFraction: 0.96,
                  height: MediaQuery.of(context).size.height - bottomNavigationBarHeight - indicatorHeight,
                  onPageChanged: (index, reason) {
                    setState(() {
                      widget.updateIndex(index);
                    });
                  }),
            ),
          ),
          if (widget.cards.length > 1)
            Padding(
              padding: EdgeInsets.symmetric(vertical: 10),
              child: Container(
                height: indicatorHeight,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: widget.cards.asMap().entries.map((entry) {
                    return GestureDetector(
                      onTap: () => widget.carouselController.animateToPage(entry.key),
                      child: Container(
                        width: 12.0,
                        height: 12,
                        margin: EdgeInsets.symmetric(horizontal: 4.0),
                        decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: (Theme.of(context).brightness == Brightness.dark ? Colors.white : Colors.black)
                                .withOpacity(widget.cardIndex == entry.key ? 0.9 : 0.4)),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
