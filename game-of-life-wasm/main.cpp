using SizeType = decltype(sizeof(void*));

//The min maxNumOfNeighbours is 3 or 4
template<int maxNumOfNeighbours = 8, SizeType height = 50, SizeType width = 50>
class LifeGame {
public:
	static constexpr int RuleCount = maxNumOfNeighbours * 2;

	//look up table of rules
	struct Rules {
	public:
		/*
		Useage Example:
			Rules rules;
			bool cellValue = false;
			int sumOfNeighbours = 3;
			//set cellValue to next cell value
			cellValue = rules.values[(maxNumOfNeighbours*cellValue)+sumOfNeighbours];
		*/
		bool values[maxNumOfNeighbours * 2];
		constexpr Rules()
			: values() {
			//set all values to zero
			for (bool value : values) {
				value = false;
			}

			//define all dead cell rules
			//birth
			values[(maxNumOfNeighbours * false) + 3] = true;
			//nothing happens for the rest

			//define all live cell rules
			/*underpopulation, these should be already defined thanks to
			  zero initoration.*/
			  //r[(maxNumOfNeighbours * true) + 0] = false;
			  //r[(maxNumOfNeighbours * true) + 1] = false;
			  //lives on to the next generation
			values[(maxNumOfNeighbours * true) + 2] = true;
			values[(maxNumOfNeighbours * true) + 3] = true;
			//the rest dies from overpopulation
		}
	};

	struct States {
	public:
		static constexpr SizeType size = height * width;
		using Values = bool[size];
		Values values = {};

		template<typename Type>
		constexpr States(const Type& v, SizeType i = 0) {
			for (bool value : v) {
				values[i] = value;
				++i;
			}
		}
		States() = default;

		inline constexpr bool& operator[](SizeType index) {
			return values[index];
		}

		inline constexpr bool& get(SizeType x, SizeType y) {
			return values[y * width + x];
		}

		inline constexpr operator const bool* () const {
			return values;
		}
	};

	constexpr static inline Rules getRules() {
		return Rules();
	}

	inline constexpr static bool getNewCellValue(const bool& cellValue, int sumOfNeighbours) {
		return getRules().values[(maxNumOfNeighbours * cellValue) + sumOfNeighbours];
	}

	constexpr static bool getCellValue(States& source, SizeType x, SizeType y) {
		if (0 <= x && x < width && 0 <= y && y < height) {
			return source.get(x, y);
		}
		return false;
	}

	//to do maybe use a loop
	constexpr static SizeType getSumOfNeighbours(States& source, SizeType x, SizeType y) {
		//check all directions
		SizeType sum = 0;
		sum += getCellValue(source, x + 1, y);
		sum += getCellValue(source, x, y + 1);
		sum += getCellValue(source, x + 1, y + 1);
		sum += getCellValue(source, x + 1, y - 1);

		//mirror
		sum += getCellValue(source, x - 1, y);
		sum += getCellValue(source, x, y - 1);
		sum += getCellValue(source, x - 1, y - 1);
		sum += getCellValue(source, x - 1, y + 1);
		return sum;
	}

	//to do use a reference
	constexpr static const States getNewStates(States states) {
		States newStates;
		for (int x = 0; x < width; ++x) {
			for (int y = 0; y < height; ++y) {
				newStates.get(x, y) = getNewCellValue(states.get(x, y), getSumOfNeighbours(states, x, y));
			}
		}
		return newStates;
	}

	static void update(States& states) {
		states = LifeGame<>::getNewStates(states);
	}
};

constexpr SizeType equalLength(bool const* left, SizeType leftSize, bool const* right, SizeType rightSize, SizeType i = 0) {
	return i < leftSize && i < rightSize && left[i] == right[i] ? equalLength(left, leftSize, right, rightSize, ++i) : i;
}

constexpr SizeType equal(bool const* left, SizeType leftSize, bool const* right, SizeType rightSize, SizeType i = 0) {
	if (leftSize != rightSize) return false;
	while (i < leftSize && i < rightSize && left[i] == right[i]) {
		++i;
	}
	return i == leftSize;
}

struct Blicker {
	constexpr static int squareSize = 3;
	using PlaySpace = LifeGame<8, squareSize, squareSize>;
	constexpr static SizeType square = PlaySpace::States::size;
	using States = PlaySpace::States::Values;
	constexpr static States state1 =
	{
		0,0,0,
		1,1,1,
		0,0,0
	};
	constexpr static States state2 =
	{
		0,1,0,
		0,1,0,
		0,1,0
	};

	constexpr static auto newState1 = PlaySpace::getNewStates(state1);
	constexpr static auto newState2 = PlaySpace::getNewStates(state2);

	static_assert(
		equal(state1, square, state2, square) == false &&
		equal(state1, square, state1, square) == true,
		"equal state function not working"
	);
	static_assert(
		equal(newState1.values, square, state2, square) == true &&
		equal(newState2.values, square, state1, square) == true,
		"blicker not working"
	);
};

//Code for WASM
using LifeGame85050 = LifeGame<>;
LifeGame85050::States memory;
extern "C" void memcpy(void*, void*, SizeType);

bool boolToCopy[50];

extern "C" bool* getMemory() {
	for (int i = 50 * 25; i < 50 * 26; ++i) {
		memory.values[i] = 1;
	}
	return memory.values;
}

extern "C" void updateStates() {
	LifeGame<>::update(memory);
}
